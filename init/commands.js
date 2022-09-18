const SlashOptions = require(DIR + '/BaseClasses/SlashOptions');
const BaseCommand = require(DIR + '/BaseClasses/BaseCommand');

const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');


/**
 * Массив контекстных и слеш команд
 * @type {Object[]}
 */
let applicationCommands = [];

/**
 * Список модулей
 * @type {Object.<string, BaseCommand>}
 */
global.commands = {};

/**
 * Массив названий модулей, где есть обработчик сообщений
 * @type {string[]}
 */
let messageCommands = [];

/**
 * Добавляет в массив слеш-команду
 * @param {BaseCommand} c Объект команды
 */
const addSlashCommand = c => {
	applicationCommands.push({
		name: c.name,
		description: c.description.toString(),
		description_localizations: c.description.toDiscord(),
		options: c.slashOptions.toDiscord()
	});
}

/**
 * Добавляет в массив контекстную команду
 * @param {BaseCommand} c Объект команды
 */
const addContextUserCommand = c => {
	applicationCommands.push({
		name: c.name,
		type: 2
	});
}

/**
 * Возвращает разницу во времени в ms
 * @param {[number, number]} timeStart Стартовая unixtime метка
 * @return {number}
 */
const getTimePerformance = timeStart => {
	const timeEnd = process.hrtime(timeStart);
	return (timeEnd[0]*1000) + (timeEnd[1] / 1000000);
}

/**
 * Отправляет запрос к API с добавлением контекстных и слеш команд
 */
const sendApplicationGuildCommands = () => {
	const route = Routes.applicationGuildCommands(client.user.id, guild.id);

	new REST({ version: '9' }).setToken(process.env.TOKEN).put(route, {
		body: applicationCommands
	});
}

/**
 * Добавляет к модулю "handler" массив модулей с обработкой сообщений
 */
const initMessageHandler = () => {
	if(!commands.handler?.active) return;

	commands.handler.commands = messageCommands;
}


/**
 * Определяет модули бота
 */
module.exports = async () => {

	console.log('Loading commands:');

	const files = fs.readdirSync('./commands/');
	for(const name of files){

		const path = './commands/' + name + '/index.js';
		if(debugAllowModules.length && debugAllowModules.indexOf(name) === -1){
			log.initText += log.warn('> ' + path + ': debug');
			continue;
		}

		const timeStart = process.hrtime();

		const Command = require('.' + path);

		commands[name] = await new Command(path);

		console.log(commands[name]);
		return;

		if(commands[name].active){
			if(commands[name].message !== constants.DEFAULT_FUNC) messageCommands.push(name);
			if(commands[name].slash !== constants.DEFAULT_FUNC) addSlashCommand(commands[name]);
			if(commands[name].contextUser !== constants.DEFAULT_FUNC) addContextUserCommand(commands[name]);
		}

		log.initText += log.load('> ' + path, getTimePerformance(timeStart), commands[name].active);
	}

	if(!debugAllowModules.length) sendApplicationGuildCommands();

	initMessageHandler();

	global.commands = commands;
}
