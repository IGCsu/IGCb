const UserLevelCard = require('./UserLevelCard/UserLevelCard');
const UserLevelCards = require('./UserLevelCard/UserLevelCard');

class UserLevels {

	/**
	 * Содержит true - если пользователь был найден в базе
	 * @type {Boolean}
	 */
	finded = false;

	/**
	 * Массив уровней
	 * @type {Array}
	 */
	#roles = [];

	/**
	 * Массив ID ролей уровней. Используется для поиска.
	 * @type {Array}
	 */
	#rolesIDs = [];

	/**
	 * Содержит объект примитивных данных пользователя
	 * @type {Object}
	 */
	#primitiveData = {};

	/**
	 * Содержит объект продвинутых данных пользователя
	 * @type {Object}
	 */
	#advancedData = {};

	/**
	 * Содержит эмбед данных
	 * @type {MessageEmbed}
	 */
	#embed = undefined;

	/**
	 * Получение пользователя из БД.
	 * @param {GuildMember} member
	 * @param {Object[]} roles Массив уровней
	 * @param {string[]} rolesIDs Массив ID ролей уровней.
	 * @param {boolean} [create=false] Если true - пользователь будет создан в
	 *   базе, если не будет найден
	 * @return {Object} Объект пользователя
	 */
	constructor (member, roles, rolesIDs, create) {

		this.member = member;
		this.#roles = roles;
		this.#rolesIDs = rolesIDs;

		return new Promise(async resolve => {
			const users = await DB.query('SELECT * FROM levels WHERE id = ?', [
				this.member.id
			]);


			if (users[0]) {
				this.finded = true;
				this.#primitiveData = {
					messagesLegit: users[0].messagesLegit,
					messagesAll: users[0].messagesAll,
					activity: users[0].activity,
					symbols: users[0].symbols,
					last: users[0].last
				};
			} else if (create) {
				await DB.query('INSERT INTO levels (`id`) VALUES (?)', [this.member.id]);
				this.#primitiveData = {
					messagesLegit: 0,
					messagesAll: 0,
					activity: 30,
					symbols: 0,
					last: 0
				};
			}

			resolve(this);
		});
	};

	/**
	 * Обновляет данные пользователя в базе данных
	 */
	async update () {
		// TODO: Модулю настала пизда, очень много флудит коннектами к БД. 
		//  Надо сделать кеширование левелов и регулярную синхронизацию с БД. 
		//  Пушто создание коннекта после каждого сообщения юзера - кладет БД.
		//  На похуй будем ловить ошибки от базы, хуй с ней, если скипнем одно-два сообщения юзера
		try {
			await DB.query(
				'UPDATE levels SET messagesAll = ?, messagesLegit = ?, symbols = ?, last = ? WHERE id = ?',
				[
					this.#primitiveData.messagesAll,
					this.#primitiveData.messagesLegit,
					this.#primitiveData.symbols,
					this.#primitiveData.last,
					this.member.id
				]
			);
		} catch (e) {}

		return this;
	};

	/**
	 * Регистрирует новое сообщение пользователя.
	 * После регистрации обновляются примитивные данные, но продвинутые теряют
	 * свою актуальность, потому очищаются.
	 * @param {Message} msg Сообщение пользователя
	 */
	userMessageCounting (msg) {
		const timestamp = Math.floor(msg.createdTimestamp / 1000);

		this.#primitiveData.messagesAll += 1;
		this.#primitiveData.symbols += msg.content.length;

		if (this.#primitiveData.last + 60 <= timestamp) {
			this.#primitiveData.last = timestamp;
			this.#primitiveData.messagesLegit += 1;
		}

		this.#advancedData = {};
		this.#embed = undefined;

		return this;
	};

	/**
	 * Обновляет роль пользователя в дискорде, если требуется
	 */
	updateRole () {
		if (this.member.id === '256114365894230018') return;

		const role = this.getRole();

		if (this.member.roles.cache.has(role.id)) return;

		if (role.id !== '648762974277992448') {
			this.member.roles.add(role.cache, 'По причине изменения уровня');
		}

		this.member.roles.cache
			.filter(r => this.#rolesIDs.includes(r.id))
			.each(r => {
				if (r.id !== role.id) {
					this.member.roles.remove(r, 'По причине изменения уровня');
				}
			});

		return this;
	};


	/**
	 * ***************************************************************************
	 * Функции возвращения примитивных данных
	 * ***************************************************************************
	 */

	/**
	 * Возвращает количество всех сообщений пользователя
	 * @return {Number}
	 */
	getMessagesAll () {
		return this.#primitiveData.messagesAll;
	};

	/**
	 * Возвращает количество только засчитанных сообщений пользователя
	 * @return {Number}
	 */
	getMessagesLegit () {
		return this.#primitiveData.messagesLegit;
	};

	/**
	 * Возвращает количество старых сообщений пользователя, которые не учувствуют
	 * в подсчёте
	 * @return {Number}
	 */
	getMessagesOld () {
		return this.#primitiveData.messagesOld;
	};

	/**
	 * Возвращает количество всех символов пользователя
	 * @return {Number}
	 */
	getSymbols () {
		return this.#primitiveData.symbols;
	};

	/**
	 * Возвращает количество активных дней пользователя за последние 30 суток
	 * @return {Number}
	 */
	getActivity () {
		return 30;
		// @TODO: Сломался подсчет активности у юзеров. Пока костыль, чтобы левелинг работал
		// return this.#primitiveData.activity;
	};


	/**
	 * ***************************************************************************
	 * Функции возвращения продвинутых данных
	 * ***************************************************************************
	 */

	/**
	 * Возвращает процент оверпоста
	 * @return {Number}
	 */
	getOverpost () {
		if (this.#advancedData.overpost) return this.#advancedData.overpost;

		const messagesAll = this.getMessagesAll();
		const messagesLegit = this.getMessagesLegit();

		const overpost = Math.round(
			(messagesAll - messagesLegit) / messagesLegit * 1000
		) / 10;

		return this.#advancedData.overpost = isNaN(overpost) ? 0 : overpost;
	};

	/**
	 * Возвращает среднее количество символов в сообщениях
	 * @return {Number}
	 */
	getSymbolsAvg () {
		if (this.#advancedData.symbolsAvg) return this.#advancedData.symbolsAvg;

		const messagesAll = this.getMessagesAll();
		const symbols = this.getSymbols();

		const symbolsAvg = Math.round((symbols / messagesAll) * 10) / 10;

		return this.#advancedData.symbolsAvg = isNaN(symbolsAvg) ? 0 : symbolsAvg;
	};

	/**
	 * Возвращает процент активности
	 * @return {Number}
	 */
	getActivityPer () {
		if (this.#advancedData.activityPer) return this.#advancedData.activityPer;

		const activity = this.getActivity();

		return this.#advancedData.activityPer = Math.round(activity / 30 * 1000) /
			10;
	};

	/**
	 * Возвращает опыт без учёта штрафа
	 * @return {Number}
	 */
	getExpFull () {
		if (this.#advancedData.expFull) return this.#advancedData.expFull;

		const messagesLegit = this.getMessagesLegit();
		const symbolsAvg = this.getSymbolsAvg();

		const expFull = Math.round(messagesLegit * symbolsAvg);

		return this.#advancedData.expFull = isNaN(expFull) ? 0 : expFull;
	};

	/**
	 * Возвращает опыт
	 * @return {Number}
	 */
	getExp () {
		if (this.#advancedData.exp) return this.#advancedData.exp;

		const expFull = this.getExpFull();
		const activityPer = this.getActivityPer();

		const exp = Math.round(expFull / 100 * activityPer);

		return this.#advancedData.exp = isNaN(exp) ? 0 : exp;
	};

	/**
	 * Возвращает количество оштрафованного опыта пользователя
	 * @return {Number}
	 */
	getExpFine () {
		if (this.#advancedData.expFine) return this.#advancedData.expFine;

		const expFull = this.getExpFull();
		const exp = this.getExp();

		const expFine = expFull - exp;

		return this.#advancedData.expFine = isNaN(expFine) ? 0 : expFine;
	};

	/**
	 * Возвращает роль пользователя
	 * @return {Object}
	 */
	getRole () {
		if (this.#advancedData.role) return this.#advancedData.role;

		const exp = this.getExp();

		for (const role of this.#roles) {
			if (role.value <= exp) return this.#advancedData.role = role;
		}
	};

	/**
	 * Возвращает следующую роль пользователя. Возвращает true - если следующей
	 * роли нет
	 * @return {Object}
	 */
	getNextRole () {
		if (this.#advancedData.nextRole) return this.#advancedData.nextRole;

		const role = this.getRole();

		return this.#advancedData.nextRole = this.#roles[role.pos - 1] ?? true;
	};

	getNextRoleColor () {
		const nextRole = this.getNextRole() === true
		  ? this.getRole()
		  : this.getNextRole()


		return dec2hex(nextRole.cache.color);
	};

	/**
	 * Возвращает прогресс до следующей роли. Возвращает true - если следующей
	 * роли нет
	 * @return {Number}
	 */
	getNextRoleProgress () {
		if (this.#advancedData.nextRoleProgress) return this.#advancedData.nextRoleProgress;

		const exp = this.getExp();
		const role = this.getRole();
		const nextRole = this.getNextRole();

		if (nextRole === true) return true;

		const nextRoleProgress = Math.round(
			((exp - role.value) / (nextRole.value - role.value)) * 1000
		) / 10;

		return this.#advancedData.nextRoleProgress = nextRoleProgress;
	};


	/**
	 * ***************************************************************************
	 * Функции возвращения эмбеда
	 * ***************************************************************************
	 */

	/**
	 * Генерирует эмбед с данными пользователя
	 * @return {MessageEmbed}
	 */
	getEmbed () {
		if (this.#embed) return this.#embed;

		this.#embed = new Discord.MessageEmbed();

		this.#embed.setTitle('Статистика пользователя');

		this.addMessages();
		this.addOverpost();
		this.addSymbols();
		this.addActivity();
		this.addImage();
		this.addFooter();

		this.setColor();

		return this.#embed;
	};

	/**
	 * Добавляет к эмбеду статистику сообщений
	 */
	addMessages () {
		const messagesAll = this.getMessagesAll().toLocaleString();
		const messagesLegit = this.getMessagesLegit().toLocaleString();

		this.#embed.addFields([
			{
				name: 'Cообщения:',
				value: messagesAll,
				inline: true
			},
			{
				name: 'Из них учитываются:',
				value: messagesLegit,
				inline: true
			},
		]);
	};

	/**
	 * Добавляет к эмбеду статистику символов
	 */
	addSymbols () {
		const symbols = this.getSymbols().toLocaleString();
		const symbolsAvg = this.getSymbolsAvg().toLocaleString();

		this.#embed.addFields([
			{
				name: 'Cимволы:',
				value: symbols,
				inline: true
			},
			{
				name: 'AVG:',
				value: symbolsAvg,
				inline: true
			},
		]);
	};

	/**
	 * Добавляет к эмбеду показатель оверпоста
	 */
	addOverpost () {
		const overpost = this.getOverpost();

		this.#embed.addField('Оверпост:', overpost + '%', true);
	};

	/**
	 * Добавляет к эмбеду показатель активности
	 */
	addActivity () {
		const activity = this.getActivity();
		const activityPer = this.getActivityPer();

		//if (activityPer === 100) return;

		this.#embed.addField(
			'Активность*:',
			activityPer + '% (' + activity + '/' + '30)',
			true
		);
	};

	/**
	 * Добавляет к эмбеду количество опыта
	 */
	addExp () {
		const exp = this.getExp().toLocaleString();
		const activityPer = this.getActivityPer();
		const expFine = this.getExpFine();

		let text = exp;
		if (expFine) {
			text += ' (Вычтено из за неактивности: ' + expFine.toLocaleString() + ')';
		}

		this.#embed.addField('Опыт:', text, activityPer === 100);
	};

	/**
	 * Добавляет к эмбеду следующую роль и прогресс до неё, если есть
	 */
	addNextRole () {
		const role = this.getRole();
		const nextRole = this.getNextRole();
		const nextRoleProgress = this.getNextRoleProgress();

		let text = nextRole === true ? '🎉'
			: nextRole.cache.toString() + ' ' + nextRoleProgress + '%';

		this.#embed.addFields([{ name: 'Прогресс:', value: role.cache.toString() + ' -> ' + text }]);
	};

	/**
	 * Устанавливает у эмбеда цвет текущей роли пользователя
	 */
	setColor () {
		//const role = this.getRole();

		this.#embed.setColor("#2b2d31"); //role.cache.color
	};

	addImage () {
		this.#embed.setImage('https://cdn.discordapp.com/attachments/1039311543894020156/1130793726428586055/GpL91Zm.png');
	};

	addFooter () {
		this.#embed.setFooter('*Активность за последние 30 дней');
	};

}

module.exports = UserLevels;
