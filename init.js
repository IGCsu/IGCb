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
		if(command.short) list[command.short] = command.name;

		if(command.active && command.slash)
			commands.push({
				name : command.name,
				description : command.descriptionShort ?? command.description,
				options : command.slashOptions
			});

		if(command.active && command.contextUser)
			commands.push({ name : command.name, type : 2 });

		const timeEnd = process.hrtime(timeStart);
		const timePerf = (timeEnd[0]*1000) + (timeEnd[1] / 1000000);

		logText += log.load(path, timePerf, command.active);
	}

	new REST({ version: '9' }).setToken(config.token).put( Routes.applicationGuildCommands(client.user.id, config.home), { body : commands });

	// Генерирование и кэширование списка команд
	if(list.help) list.help.generate(list);

	return {

		list : list,

		/**
		 * Возвращает команду. При неудаче - false
		 *
		 * @param  {String} name Название команды
		 * @return {Object}      Команда
		 */
		get : function(name){
			let command = this.list[name];

			if(!command) return false;
			if(typeof command === 'string') command = this.list[command];

			return command;
		}

	};
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



module.exports = async () => {

	console.timeEnd('Сlient login');
	console.log('Start init.js');

	global.guild = await client.guilds.fetch(config.home);
	console.log('Selected guild "' + guild.name + '"');

	console.log('Loading functions:');
	await definitionFunctions();

	console.log('Loading commands:');
	global.commands = await getCommands();

	await client.user.setActivity('i!help', { type: 'LISTENING' });

	console.time('Send start bot');
	let embed = new Discord.MessageEmbed()
		.setTitle('Бот запущен')
		.setTimestamp()
		.setDescription('```ansi' + logText + '```');
	await guild.channels.cache.get('574997373219110922').send({ embeds : [embed] });
	console.timeEnd('Send start bot');

	console.time('Event messageCreate');
	client.on('messageCreate', async msg => {
		if(msg.channel.type == 'DM') return msg.reply('Лс для пидоров');
		if(msg.channel.guild.id != config.home) return;

		if(msg.content.substr(0, config.prefix.length) != config.prefix){
			if(commands.list.nocommand?.active) commands.list.nocommand.call(msg);
			return;
		}
		if(msg.author.bot) return;

		const content = msg.content.substr(config.prefix.length).split(/\s+/);
		const command = commands.get(content.shift().toLowerCase());

		if(!command || !command.active || !command.message) return;

		await command.message(msg, content);
	});
	console.timeEnd('Event messageCreate');

	console.time('Event interactionCreate');
	client.on('interactionCreate', async interaction => {
		const command = commands.get(interaction.commandName ?? interaction.customId.split('|')[0]);

		if(!command || !command.active) return;

		let type = undefined;
		if(interaction.isCommand()) type = 'slash';
		if(interaction.isUserContextMenu()) type = 'contextUser';
		if(interaction.isMessageContextMenu()) type = 'contextMesage';
		if(interaction.isAutocomplete()) type = 'autocomplete';
		if(interaction.isButton()) type = 'button';

		if(!type || !command[type]) return;

		await command[type](interaction);
	});
	console.timeEnd('Event interactionCreate');

	console.time('Event raw');
	client.on('raw', async data => {
		if(data.t != 'INTERACTION_CREATE') return;
		if(data.d.type != 5) return;
		const command = commands.get('poll');
		if(!command || !command.active) return;
		const type = 'modal';

		await command[type](data.d);
	});
	console.timeEnd('Event raw');

	log.start('== Bot ready ==');

};
