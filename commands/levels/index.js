const fetch = require('node-fetch');
const slashOptions = require('./slashOptions.json');
const { title, description } = require('./about.json');
const noXPChannels = require('./noXPChannels.json');

module.exports = {

	active : true,
	category : 'Уровни активности',

	name : 'levels',
	title : title,
	description : description,
	slashOptions : slashOptions,

	noXPChannels : noXPChannels,

	init : async function(path){

		this.roles = DB.query('SELECT * FROM levels_roles');
		this.roles.sort((a, b) => b.value - a.value);
		this.rolesIDs = [];

		for(let r = 0; r < this.roles.length; r++){
			this.roles[r].pos = r;
			this.roles[r].cache = guild.roles.cache.get(this.roles[r].id);
			if(this.roles[r].id == '648762974277992448') continue;
			this.rolesIDs.push(this.roles[r].id);
		}

		return this;

	},


	/**
	 * Обработка команды
	 * Выдаёт статистику по пользовтаелю и ссылку на страницу
	 * @param {CommandInteraction|UserContextMenuInteraction} int    Команда пользователя
	 * @param {GuildMember}                                   member Объект пользователя
	 */
	call : async function(int, member){

		const name = member2name(member, true);
		const user = this.getUser(member.user.id);

		if(!user) return { error: 'Unknown User' };

		let embed = new Discord.MessageEmbed()
			.setTitle('Статистика пользователя')
			.setThumbnail(member.user.avatarURL({ dynamic: true }))

		try {
			embed.setDescription('<@' + user.id + '>');
			embed.addField('Cообщения:',
				user.messagesAll.toLocaleString() + ' (Из них учитываются: ' + user.messagesLegit.toLocaleString() + ')');
			embed.addField('Cимволы:',
				user.symbols.toLocaleString() + '  (AVG ' + (user.symbolsAvg = this.getSymbolsAvg(user)).toLocaleString() + ')');
			embed.addField('Оверпост:', (user.overpost = this.getOverpost(user)) + '%');
			user.activityPer = this.getActivityPer(user);
			if(user.activityPer != 100)
			embed.addField('Активность за последние 30 дней:',
				(user.activityPer = this.getActivityPer(user)) + '% (' + Math.round(user.activityPer * 30/100) + '/' + '30)');

			user.expFine = this.getExpFine(user);

			embed.addField('Опыт:',
				(user.exp = this.getExp(user)).toLocaleString() +
				(user.expFine ? (' (Вычтено из за неактивности: ' + user.expFine.toLocaleString() + ')') : ''));

			user.nextRole = this.getNextRole(user);

			let txt = '🎉'
			if(user.nextRole != true){
				txt = '<@&' + user.nextRole.cache.id + '> ' + (user.nextRoleProgress = this.getNextRoleProgress(user)) + '%'
			};

			embed.addField('Прогресс:', 
				'<@&' + user.role.cache.id + '> -> ' + txt)
			
			embed.setColor(user.role.cache.color);

		}catch(e){
			console.error(int, member, user, embed, e.toString());
			return { error: 'Can\'t resolve the user data' };
		};


		return {
			embeds : [embed],
			components: [{type:1, components: [
				{ type: 2, style: 5, url: 'https://igc.su/levels', label: 'Таблица' },
				{ type: 2, style: 5, url: 'https://igc.su/levels?id=' + user.id, label: 'Статистика пользователя' }
			]}],
		};

	},


	/**
	 * Обработка слеш-команды
	 * @param {CommandInteraction} int Команда пользователя
	 */
	slash : async function(int){
		const content = await this.call(int, int.options.getMember('user') ?? int.member);

		if(content.error)
			return await int.reply({ content: reaction.emoji.error + ' ' + localize(int.locale, content.error), ephemeral: true });

		await int.reply(content);
	},

	/**
	 * Обработка контекстной команды
	 * @param {UserContextMenuInteraction} int
	 */
	contextUser : async function(int){
		const content = await this.call(int, int.targetMember);

		if(content.error)
			return await int.reply({ content: reaction.emoji.error + ' ' + localize(int.locale, content.error), ephemeral: true });

		content.ephemeral = true;
		await int.reply(content);
	},



	/**
	 * Мониторинг всех сообщений для начисления опыта пользователям. Игнорируются сообщения бота и в некоторых каналах.
	 * @param  {Message} msg Сообщение пользователя
	 */
	monitoring : async function(msg){
		if(msg.author.bot) return;
		if(this.noXPChannels.includes(msg.channel.parentId)) return;
		if(this.noXPChannels.includes(msg.channelId)) return;

		let user = this.getUser(msg.author.id, true);
		user = this.userMessageСounting(user, msg);

		if(msg.author.id == '256114365894230018') return;

		const role = this.getRole(user);
		if(msg.member.roles.cache.has(role.id)) return;

		// try{
			if(role.id != '648762974277992448')
				msg.member.roles.add(role.cache, 'По причине изменения уровня');

			msg.member.roles.cache.filter(r => this.rolesIDs.includes(r.id)).each(r => {
				if(r.id != role.id) msg.member.roles.remove(r, 'По причине изменения уровня');
			});
		// }catch(e){}

	},


	/**
	 * Получение пользователя из БД.
	 * @param  {String}  id     ID пользователя
	 * @param  {Boolean} create Если true - пользователь будет создан в базе, если не будет найден
	 * @return {Object}         Объект пользователя
	 */
	getUser : (id, create) => {

		const users = DB.query('SELECT * FROM levels WHERE id = ?', [id]);
		if(users[0]) return users[0];

		if(!create) return false;

		DB.query('INSERT INTO levels (`id`) VALUES (?)', [id]);
		return { id : id, last : 0, messagesAll : 0, messagesLegit : 0, symbols : 0, activity : 1 };

	},

	/**
	 * Регистрирует новое сообщение пользователю. Возвращает новый объект. Если обновление не удалось - возвращает старый объект
	 * @param  {Object}  user Объект пользователя
	 * @param  {Message} msg  Сообщение пользователя
	 * @return {Object}       Объект пользователя. Новый, если обновление удалось
	 */
	userMessageСounting : (user, msg) => {
		const timestamp = Math.floor(msg.createdTimestamp / 1000);

		let sql = 'UPDATE levels SET messagesAll = messagesAll + 1, symbols = symbols + ? WHERE id = ?';
		let dataSql = [msg.content.length, user.id];

		let newUser = {
			id : user.id,
			last : user.last,
			messagesAll : user.messagesAll + 1,
			messagesLegit : user.messagesLegit,
			symbols : user.symbols + msg.content.length,
			activity : user.activity
		};

		if(user.last + 60 <= timestamp){
			newUser.last = timestamp;
			newUser.messagesLegit += 1;

			sql = 'UPDATE levels SET messagesAll = messagesAll + 1, messagesLegit = messagesLegit + 1, symbols = symbols + ?, last = ? WHERE id = ?';
			dataSql = [msg.content.length, timestamp, user.id];
		}

		try{
			DB.query(sql, dataSql);
			return newUser;
		}catch(e){
			console.error('DB error occurred:\n' + e);
			return user;
		}
	},




	/**
	 * ===========================================================================
	 * Функции, возвращающие данные пользователя
	 * ===========================================================================
	 */

	/**
	 * Возвращает процент оверпоста
	 * @param  {Object} user Объект пользователя
	 * @return {Number}      Показатель оверпоста
	 */
	getOverpost : function(user){
		const overpost = Math.round( (user.messagesAll - user.messagesLegit) / user.messagesLegit * 1000) / 10;
		return isNaN(overpost) ? 0 : overpost;
	},

	/**
	 * Возвращает среднее количество символов в сообщениях
	 * @param  {Object} user Объект пользователя
	 * @return {Number}      Среднее количество символов в сообщениях
	 */
	getSymbolsAvg : function(user){
		const symbolsAvg = Math.round( (user.symbols / user.messagesAll) * 10) / 10;
		return isNaN(symbolsAvg) ? 0 : symbolsAvg;
	},

	/**
	 * Возвращает процент активности
	 * @param  {Object} user Объект пользователя
	 * @return {Number}      Процент активности
	 */
	getActivityPer : function(user){
		return Math.round(user.activity/30*1000)/10;
	},

	/**
	 * Возвращает опыт
	 * @param  {Object} user             Объект пользователя
	 * @param  {Number} user.symbolsAvg  Среднее количество символов в сообщениях
	 * @param  {Number} user.activityPer Процент активности
	 * @return {Number}                  Опыт
	 */
	getExp : function(user){
		if(!user.symbolsAvg) user.symbolsAvg = this.getSymbolsAvg(user);
		if(!user.activityPer) user.activityPer = this.getActivityPer(user);

		const exp = Math.round(user.messagesLegit * user.symbolsAvg / 100 * user.activityPer);
		return isNaN(exp) ? 0 : exp;
	},

	/**
	 * Возвращает количество оштрафованного опыта пользователя
	 * @param  {Object} user             Объект пользователя
	 * @param  {Number} user.activityPer Процент активности
	 * @param  {Number} user.exp         Опыт
	 * @return {Number}                  Оштрафованный опыт
	 */
	getExpFine : function(user){
		if(!user.activityPer) user.activityPer = this.getActivityPer(user);
		if(!user.exp) user.exp = this.getExp(user);

		const expFine = Math.round(100 / user.activityPer * user.exp - user.exp);
		return isNaN(expFine) ? 0 : expFine;
	},

	/**
	 * Возвращает роль пользователя
	 * @param  {Object} user     Объект пользователя
	 * @param  {Number} user.exp Опыт
	 * @return {Object}          Текущая роль
	 */
	getRole : function(user){
		if(!user.exp) user.exp = this.getExp(user);

		for(const role of this.roles)
			if(role.value <= user.exp) return role;
	},

	/**
	 * Возвращает следующую роль пользователя. Возвращает true - если следующей роли нет
	 * @param  {Object} user      Объект пользователя
	 * @param  {Number} user.exp  Опыт
	 * @param  {Object} user.role Текущая роль
	 * @return {Object}           Следующая роль
	 */
	getNextRole : function(user){
		if(!user.exp) user.exp = this.getExp(user);
		if(!user.role) user.role = this.getRole(user);

		return this.roles[user.role.pos - 1] ?? true;
	},

	/**
	 * Возвращает прогресс до следующей роли. Возвращает true - если следующей роли нет
	 * @param  {Object} user          Объект пользователя
	 * @param  {Number} user.exp      Опыт
	 * @param  {Object} user.role     Текущая роль
	 * @param  {Object} user.nextRole Следующая роль
	 * @return {Number}               Прогресс до следующей роли
	 */
	getNextRoleProgress : function(user){
		if(!user.exp) user.exp = this.getExp(user);
		if(!user.role) user.role = this.getRole(user);
		if(!user.nextRole) user.nextRole = this.getNextRole(user);

		if(user.nextRole == true) return true;

		return Math.round(((user.exp - user.role.value)/(user.nextRole.value - user.role.value))*1000)/10;
	},

};
