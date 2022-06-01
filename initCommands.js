const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');


/**
 * Массив контекстных и слеш команд
 * @type {Array}
 */
let commands = [];

/**
 * Список модулей
 * @type {Object}
 */
let list = {};

/**
 * Массив модулей где есть обработчик сообщений
 * @type {Array}
 */
let message = [];


/**
 * Добавляет в массив слеш-команду
 * @param {Object} c Объект команды
 */
const addSlashCommand = c => {
	commands.push({
		name: c.name,
		description: c.description?.ru ?? c.title.ru,
		description_localizations: getUpdatedLangs(c.description ?? c.title),
		options: getSlashOptions(c.slashOptions)
	});
};


/**
 * Возвращает опции слеш-команды
 * @param  {Object} slashOptions Объект опций слеш-команды
 * @return {Array}
 */
const getSlashOptions = slashOptions => {
	let options = [];

	for(let name in slashOptions){

		const data = {
			name : name,
			description : slashOptions[name].description.ru,
			description_localizations : getUpdatedLangs(slashOptions[name].description)
		};

		if(slashOptions[name].slashOptions){
			data.options = getSlashOptions(slashOptions[name].slashOptions);
		}

		if(slashOptions[name].choices){
			data.choices = getChoices(slashOptions[name].choices);
		}

		for(let i in slashOptions[name]){
			if(i == 'description' || i == 'slashOptions' || i == 'choices') continue;
			data[i] = slashOptions[name][i];
		}

		options.push(data);

	}

	return options;

};


/**
 * Возвращает селектор слеш-команды
 * @param  {Object} slashChoices Объект опций слеш-команды
 * @return {Array}
 */
const getChoices = slashChoices => {
	let choices = [];

	for(let value in slashChoices){
		choices.push({
			value : value,
			name : slashChoices[value].ru,
			name_localizations : getUpdatedLangs(slashChoices[value])
		});
	}

	return choices;
};


/**
 * Обновляет объект локализации.
 * Удаляет "en", заменяя его на "en-US" и "en-GB"
 * @param  {Object} oldData Объект с разными локализациями
 * @return {Object}
 */
const getUpdatedLangs = oldData => {
	let newData = {};

	for(let lang in oldData){
		if(lang == 'en') continue;
		newData[lang] = oldData[lang];
	}

	if(oldData['en']) newData['en-GB'] = newData['en-US'] = oldData['en'];

	return newData;
};


/**
 * Добавляет в массив контекстную команду
 * @param {Object} c Объект команды
 */
const addContextUserCommand = c => commands.push({ name: c.name, type: 2 });


/**
 * Возвращает разницу во времени в ms
 * @param  {Number} timeStart Стартовая unixtime метка
 * @return {Number}
 */
const getTimePerformance = timeStart => {
	const timeEnd = process.hrtime(timeStart);
	return (timeEnd[0]*1000) + (timeEnd[1] / 1000000);
};


/**
 * Отправляет запрос к API с добавлением контекстных и слеш команд
 */
const applicationGuildCommands = () => {
	const route = Routes.applicationGuildCommands(client.user.id, config.home);
	new REST({ version: '9' }).setToken(config.token).put(route, {
		body: commands
	});
}


/**
 * Добавляет к модулю "handler" массив модулей с обработкой сообщений
 */
const initMessageHandler = () => {
	if(!list.handler?.active) return;

	list.handler.commands = message;
}


/**
 * Возвращает команды бота
 * @param  {Array}  Массив модулей разрешённых к подключению.
 * @return {Object}
 */
module.exports = async debugAllowModules => {

	const files = await fs.readdirSync('./commands/');
	for(const name of files){

		const path = './commands/' + name + '/index.js';
		if(debugAllowModules.length && debugAllowModules.indexOf(name) === -1){
			log.initText += log.warn('> ' + path + ': debug');
			continue;
		}

		const timeStart = process.hrtime();

		let command = require(path);

		if(command.active) command = await command.init(path);

		list[name] = command;

		if(command.active){
			if(command.message) message.push(name);
			if(command.slash) addSlashCommand(command);
			if(command.contextUser) addContextUserCommand(command);
		}

		log.initText += log.load('> ' + path, getTimePerformance(timeStart), command.active);
	}

	if(!debugAllowModules.length) applicationGuildCommands();

	initMessageHandler();

	return list;
};
