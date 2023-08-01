const SlashOptions = require('../../BaseClasses/SlashOptions.js');
const BaseCommand = require('../../BaseClasses/BaseCommand.js');
const LangSingle = require('../../BaseClasses/LangSingle.js');

const fetch = require('node-fetch');
const { title } = require('./about.json');

const initFunctions = require('./initFunctions.js');

class Handler extends BaseCommand {

	/**
	 * Объект функций модуля
	 * @type {Object}
	 */
	functions = {};

	/**
	 * Массив функций, вызываемых при сообщении в любом канале
	 * @type {Object}
	 */
	allChannels = {};

	/**
	 * Объект каналов и категориий, содержашие объекты функций
	 * @type {Object}
	 */
	allowedChannelsFunctions = {};

	/**
	 * Массив модулей где есть обработчик сообщений.
	 * Пополняется функцией "initMessageHandler()" при инициализации бота.
	 * @type {Array}
	 */
	commands = [];

	constructor (path) {
		super(path);

		this.category = 'Утилиты';
		this.name = 'handler';
		this.title = this.description = new LangSingle(title);

		return new Promise(async resolve => {
			await this.siteStatusCheck();

			if (!this.siteStatus) {
				log.initText += log.error(path + ': Сайт недоступен');
			}

			const {
				functions,
				allChannels,
				allowedChannelsFunctions
			} = await initFunctions();

			this.functions = functions;
			this.allChannels = allChannels;
			this.allowedChannelsFunctions = allowedChannelsFunctions;

			client.on('messageCreate', async msg => {
				if (msg.channel.type === 'DM') return;
				if (msg.channel.guild.id !== guild.id) return;

				msg.indexFunc = 'handler';

				await this.call(msg);
			});

			resolve(this);
		});
	}


	/**
	 * Проверяет статус сайта и возвращает результат
	 * @return {Boolean}
	 */

	async siteStatusCheck () {
		try {
			const response = await fetch(constants.SITE_LINK, {
				redirect: 'manual'
			});
			return this.siteStatus = response.status === 200;
		} catch (e) {
			return this.siteStatus = false;
		}
	}


	/**
	 * Обработка сообщения, которое не является командой
	 * @param {Message} msg Сообщение пользователя
	 */
	async call (msg) {
		for (let command of this.commands) {
			this.commandMessage(commands[command], msg);
		}

		const thread = msg.channel.isThread();
		const channel = thread ? msg.channel.parentId : msg.channel.id;
		const category = thread
			? msg.channel.parent?.parentId
			: msg.channel?.parentId;

		if(!channel || !category) return;

		let functions = new Set();

		this.addAllowedChannelsFunctions(functions, category, thread);
		this.addAllowedChannelsFunctions(functions, channel, thread);
		this.addAllChannelsFunctions(functions);

		this.callFunctions(functions, msg);

	}

	/**
	 * Обработка сообщения сторонним модулем.
	 * При двух ошибках в модуле подряд - отключает ссылку на обработчик модуля.
	 * @param {Object}  command Объект модуля
	 * @param {Message} msg Сообщение пользователя
	 */
	async commandMessage (command, msg) {
		try {
			if (command.active) await command.message(msg);
		} catch (e) {
			const active = e.handler(command.name, false);
			if (!active) delete this.commands[command.name];
		}
	}

	/**
	 * Добавляет к списку functions, функции которые необходимо вызвать.
	 * Выборка из функций каналов или категорий, а так же проверка на тред.
	 * @param {Set}     functions Список функций, которые необходимо вызвать
	 * @param {String}  id        ID канала или категории
	 * @param {Boolean} thread    Является ли канал тредом, в котором написано
	 *   сообщение
	 */
	async addAllowedChannelsFunctions (functions, id, thread) {
		if (!this.allowedChannelsFunctions[id]) return;

		for (let name in this.allowedChannelsFunctions[id]) {
			if (!thread || this.allowedChannelsFunctions[id][name]) {
				functions.add(name);
			}
		}
	}

	/**
	 * Добавляет к списку functions, функции которые необходимо вызвать.
	 * Добавляет общие функции, не зависящие от канала.
	 * @param {Set} functions Список функций, которые необходимо вызвать
	 */
	async addAllChannelsFunctions (functions) {
		for (let name in this.allChannels) {
			functions.add(name);
		}
	}

	/**
	 * Вызов функций.
	 * При двух ошибках в функции подряд - отключает функцию.
	 * @param {Set}     functions Список функций, которые необходимо вызвать
	 * @param {Message} msg       Сообщение пользователя
	 */
	async callFunctions (functions, msg) {
		for (let name of functions) {

			try {
				initLog(msg, name);
				await this.functions[name].call(msg);
			} catch (e) {
				const active = e.handler('handler/func/' + name, false);
				if (!active) await this.shutdownFunction(name);
			}

		}
	}

	/**
	 * Отключение функции.
	 * Перебирает объект разрешённых каналов в поиске удаляемой функции и удаляет
	 * её.
	 * @param {String} name Название функции
	 */
	async shutdownFunction (name) {
		this.functions[name].active = false;
		if (this.allChannels[name]) delete this.allChannels[name];
		for (let id in this.allowedChannelsFunctions) {
			if (this.allowedChannelsFunctions[id][name]) {
				delete this.allowedChannelsFunctions[id][name];
			}
		}
	}
}

module.exports = Handler;
