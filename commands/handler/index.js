const fetch = require('node-fetch');
const { title } = require('./about.json');

const initFunctions = require('./initFunctions');

module.exports = {

	active : true,
	category : 'Утилиты',

	name : 'handler',
	title : title,

	/**
	 * Объект функций модуля
	 * @type {Object}
	 */
	functions : {},

	/**
	 * Массив функций, вызываемых при сообщении в любом канале
	 * @type {Object}
	 */
	allChannels : {},

	/**
	 * Объект каналов и категориий, содержашие объекты функций
	 * @type {Object}
	 */
	allowedChannelsFunctions : {},

	/**
	 * Массив модулей где есть обработчик сообщений.
	 * Пополняется функцией "initMessageHandler()" при инициализации бота.
	 * @type {Array}
	 */
	commands : [],

	init : async function(path){

		await this.siteStatusCheck();
		if(!this.siteStatus) log.initText += log.error(path + ': Сайт недоступен');

		const { functions, allChannels, allowedChannelsFunctions } = await initFunctions();
		this.functions = functions;
		this.allChannels = allChannels;
		this.allowedChannelsFunctions = allowedChannelsFunctions;

		client.on('messageCreate', async msg => {
			if(msg.channel.type === 'DM') return;
			if(msg.channel.guild.id !== guild.id) return;

			await this.call(msg);
		});

		return this;
	},


	/**
	 * Проверяет статус сайта и возвращает результат
	 * @return {Boolean}
	 */
	siteStatusCheck: async function(){
		const response = await fetch('https://igc.su', { redirect: 'manual' });

		return this.siteStatus = response.status == '200' ? true : false;
	},

	/**
	 * Обработка сообщения, которое не является командой
	 * @param {Message} msg Сообщение пользователя
	 */
	call: async function(msg){
		for(let command of this.commands) this.commandMessage(commands[command], msg);

		const thread = msg.channel.isThread();
		const channel = thread ? msg.channel.parentId : msg.channel.id;
		const category = thread ? msg.channel.parent.parentId : msg.channel.parentId;

		let functions = new Set();

		this.addAllowedChannelsFunctions(functions, category, thread);
		this.addAllowedChannelsFunctions(functions, channel, thread);
		this.addAllChannelsFunctions(functions);

		this.callFunctions(functions, msg);

	},

	/**
	 * Обработка сообщения сторонним модулем.
	 * При двух ошибках в модуле подряд - отключает ссылку на обработчик модуля.
	 * @param {Object}  command Объект модуля
	 * @param {Message} msg Сообщение пользователя
	 */
	commandMessage: async function(command, msg){
		try{
			if(command.active) await command.message(msg);
		}catch(e){
			const active = errorHandler(e, command.name, false);
			if(!active) delete this.commands[command.name];
		}
	},

	/**
	 * Добавляет к списку functions, функции которые необходимо вызвать.
	 * Выборка из функций каналов или категорий, а так же проверка на тред.
	 * @param {Set}     functions Список функций, которые необходимо вызвать
	 * @param {String}  id        ID канала или категории
	 * @param {Boolean} thread    Является ли канал тредом, в котором написано сообщение
	 */
	addAllowedChannelsFunctions: async function(functions, id, thread){
		if(!this.allowedChannelsFunctions[id]) return;

		for(let name in this.allowedChannelsFunctions[id]){
			if(!thread || this.allowedChannelsFunctions[id][name]) functions.add(name);
		}
	},

	/**
	 * Добавляет к списку functions, функции которые необходимо вызвать.
	 * Добавляет общие функции, не зависящие от канала.
	 * @param {Set} functions Список функций, которые необходимо вызвать
	 */
	addAllChannelsFunctions: async function(functions){
		for(let name in this.allChannels) functions.add(name);
	},

	/**
	 * Вызов функций.
	 * При двух ошибках в функции подряд - отключает функцию.
	 * @param {Set}     functions Список функций, которые необходимо вызвать
	 * @param {Message} msg       Сообщение пользователя
	 */
	callFunctions: async function(functions, msg){
		for(let name of functions){

			try{
				await this.functions[name].call(msg);
			}catch(e){
				const active = errorHandler(e, 'handler/func/' + name, false);
				if(!active) this.shutdownFunction(name);
			}

		}
	},

	/**
	 * Отключение функции.
	 * Перебирает объект разрешённых каналов в поиске удаляемой функции и удаляет её.
	 * @param {String} name Название функции
	 */
	shutdownFunction: async function(name){
		this.functions[name].active = false;
		if(this.allChannels[name]) delete this.allChannels[name];
		for(let id in this.allowedChannelsFunctions){
			if(this.allowedChannelsFunctions[id][name]) delete this.allowedChannelsFunctions[id][name];
		}
	},

};
