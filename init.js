const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');


/**
 * Текст лога, который отправит бот на старте.
 * @type {String}
 */
let logText = '';


/**
 * Массив модулей разрешённых к подключению.
 * Если пустой - подключаются в естественном порядке. В ином случае, подключаются лишь указанные модули.
 *
 * Пример: "help.js"
 * @type {Array}
 */
const debugAllowModules = [];


/**
 * Возвращает команды бота
 * @return {Object}
 */
const getCommands = async () => {
	const commands = [];
	const list = {};

	const files = await fs.readdirSync('./commands/');
	for(const file of files){
		const path = './commands/' + file;
		if(debugAllowModules.length && debugAllowModules.indexOf(file) === -1){
			logText += log.warn(path + ': debug');
			continue;
		}

		const timeStart = process.hrtime();

		let command = require(path);

		if(command.active) command = await command.init(path);

		list[command.name] = command;

		if(command.active && command.slash)
			commands.push({
				name: command.name,
				name_localizations: command.name_localizations,
				description: command.descriptionShort ?? command.description,
				description_localizations: command.description_localizations,
				options: command.slashOptions
			});

		if(command.active && command.contextUser){
			commands.push({ name: command.name, type: 2 });
		}

		const timeEnd = process.hrtime(timeStart);
		const timePerf = (timeEnd[0]*1000) + (timeEnd[1] / 1000000);

		logText += log.load(path, timePerf, command.active);
	}

	if(!debugAllowModules.length)
		new REST({ version: '9' }).setToken(config.token).put( Routes.applicationGuildCommands(client.user.id, config.home), { body: commands });

	return list;
}


/**
 * Определяет базовые функции и утилиты бота
 */
const definitionFunctions = () => {
	fs.readdirSync('./functions/').forEach(file => {
		const path = './functions/' + file;
		console.time(path);
		global[file.split('.')[0]] = require(path);
		console.timeEnd(path);
	});
}

/**
 * Определяет локализации бота
 */
const definitionLocales = () => {
	global.locales = {};
	fs.readdirSync('./locales/').forEach(file => {
		const path = './locales/' + file;
		console.time(path);
		locales[file.split('.')[0]] = require(path);
		console.timeEnd(path);
	});
}



module.exports = async () => {

	console.timeEnd('Сlient login');
	console.log('Start init.js');

	global.guild = await client.guilds.fetch(config.home);
	console.log('Selected guild "' + guild.name + '"');

	console.log('Loading locales:');
	await definitionLocales();

	console.log('Loading functions:');
	await definitionFunctions();

	console.log('Loading commands:');
	global.commands = await getCommands();

	await client.user.setActivity('/help', { type: 'LISTENING' });


	if(!debugAllowModules.length){
		console.time('Send start bot');
		const author = process.env.USERNAME ?? 'Host';
		let embed = new Discord.MessageEmbed()
			.setTitle('Бот запущен')
			.setTimestamp()
			.setDescription('hosted by ' + author + '\n\n```ansi' + logText + '```');
		await guild.channels.cache.get('574997373219110922').send({ embeds: [embed] });
		console.timeEnd('Send start bot');
	}


	console.time('Event messageCreate');
	client.on('messageCreate', async msg => {
		if(msg.channel.type == 'DM') return;
		if(msg.channel.guild.id != config.home) return;

		try{
			if(commands.nocommand?.active) commands.nocommand.call(msg);
		}catch(e){
			errorHandler(e, 'nocommand', msg);
		}
	});
	console.timeEnd('Event messageCreate');


	console.time('Event interactionCreate');
	client.on('interactionCreate', async int => {
		const name = int.commandName ?? int.customId.split('|')[0];

		if(!commands[name] || !commands[name].active) return;

		int.action = getInteractionAction(int);

		if(!int.action || !commands[name][int.action]) return;

		try{
			await commands[name][int.action](int);
		}catch(e){
			errorHandler(e, name, int);
		}
	});
	console.timeEnd('Event interactionCreate');


	log.start('== Bot ready ==');

};
