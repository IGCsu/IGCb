const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');


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
		console.time(path);

		let command = require(path);

		if(command.active) command = await command.init();

		list[command.name] = command;
		if(command.short) list[command.short] = command.name;

		if(command.slash)
			commands.push({ name : command.name, description : command.descriptionShort });

		if(command.contextUser)
			commands.push({ name : command.name, type : 2 });

		console.timeEnd(path);
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

	global.guild = await client.guilds.cache.get(config.home);
	console.log('Selected guild "' + guild.name + '"');

	console.log('Loading functions:');
	await definitionFunctions();

	console.log('Loading commands:');
	global.commands = await getCommands();

	await client.user.setActivity('i!help', { type: 'LISTENING' });
	log.start('== Bot ready ==');

};
