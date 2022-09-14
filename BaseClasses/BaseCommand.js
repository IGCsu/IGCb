class BaseCommand {

	/**
	 * Содержит значение активности модуля. Используется для проверки другими модулями.
	 * Вне зависимости от значения, будет подключен и инициализирован.
	 * @type {boolean}
	 * @private
	 */
	active = false;

	/**
	 * Категория модуля
	 * @type {string}
	 */
	category = 'Остальные';

	/**
	 * Название модуля. Идентично названию файла.
	 * @type {string}
	 */
	name;

	/**
	 * Короткое обозначение модуля. Содержит объект локализации.
	 * Обязательная локализация - русская.
	 * Для обозначений языков, ключей объекта используются коды языков ISO 639-1
	 * @type {Object.<string, string>}
	 */
	title;

	/**
	 * Подсказка для слеш-команды. Содержит объект локализации.
	 * Обязательная локализация - русская.
	 * Для обозначений языков, ключей объекта используются коды языков ISO 639-1
	 * @type {Object.<string, string>}
	 */
	description = this.title;

	/**
	 * Опции для слеш-команды. Если слеш-команде не нужны опции, то может содержать underfund
	 */
	slashOptions;

	/**
	 * Функция инициализации. Используется при инициализации модуля.
	 * Принимает путь к текущему файлу. Может быть использовано для логирования.
	 * @example await new Class()
	 * @param {string} path Путь к файлу
	 * @return {Promise<this>}
	 * @constructor
	 */
	constructor(path){
		this.active = true;

		return new Promise(resolve => {
			resolve(this);
		});
	}

	/**
	 * Функция отключения модуля. Инвертирует действия функции инициализации, закрывая соединения, ощищая буферы и тп.
	 * @return {Promise<this>}
	 */
	destroy(){
		this.active = false;

		return new Promise(resolve => {
			resolve(this);
		});
	}

	/**
	 * Исполняемый метод команды. Содержит базовую логику
	 * @type {function}
	 */
	call;


	/**
	 * Обработка слеш-команды
	 * @param {CommandInteraction} int Команда пользователя
	 */
	slash : async function(int){
		const content = await this.call(int, int.options.getMember('user') ?? int.member);

		if(content.error)
			return await int.reply({ content: reaction.emoji.error + ' ' + int.str(content.error), ephemeral: true });

		await int.reply(content);
	},

	/**
	 * Обработка контекстной команды
	 * @param {UserContextMenuInteraction} int
	 */
	contextUser : async function(int){
		const content = await this.call(int, int.targetMember);

		if(content.error)
			return await int.reply({ content: reaction.emoji.error + ' ' + int.str(content.error), ephemeral: true });

		content.ephemeral = true;
		await int.reply(content);
	},



	/**
	 * Обработчик сообщений пользователя
	 * Мониторинг всех сообщений для начисления опыта пользователям. Игнорируются сообщения бота и в некоторых каналах.
	 * @param {Message} msg Сообщение пользователя
	 */
	message : async function(msg){
		if(msg.author.bot) return;
		const channel = msg.channel.isThread() ? msg.channel.parent : msg.channel;
		if(this.noXPChannels.includes(channel.parentId)) return;
		if(this.noXPChannels.includes(channel.id)) return;

		let user = new UserLevels(msg.member, this.roles, this.rolesIDs, true);

		user.userMessageСounting(msg)
			.update()
			.updateRole();

	},


}

module.exports = BaseCommand;