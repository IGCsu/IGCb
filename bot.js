console.log('Start bot.js');

global.config = require('./config.json');
global.DB = new (require('sync-mysql'))(config.mysql);

global.Discord = require('discord.js');
global.client = new Discord.Client({ intents : new Discord.Intents(6143) });

client.on('ready', require('./init'));


client.on('messageCreate', async msg => {
	if(msg.author.id == client.user.id) return;
	if(msg.channel.type == 'DM') return msg.reply('Лс для пидоров');
	if(msg.channel.guild.id != config.home) return;

	if(msg.content.substr(0, config.prefix.length) != config.prefix){
		if(commands.list.nocommand) commands.list.nocommand.call(msg);
		return;
	}
	if(msg.author.bot) return;

	const content = msg.content.substr(config.prefix.length).split(/\s+/);
	const command = commands.get(content.shift().toLowerCase());

	if(!command || !command.active || !command.message) return;

	await command.message(msg, content);
});


client.on('interactionCreate', async interaction => {
	const command = commands.get(interaction.commandName);

	if(!command || !command.active) return;

	let type = undefined;
	if(interaction.isCommand()) type = 'slash';
	if(interaction.isUserContextMenu()) type = 'contextUser';
	if(interaction.isMessageContextMenu()) type = 'contextMesage';

	if(!type || !command[type]) return;

	await command[type](interaction);
});


// client.on('raw', console.log);


console.time('Сlient login');
client.login(config.token);
