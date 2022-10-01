console.time('Client initialized in');
global.Discord = require('discord.js');
global.client = new Discord.Client({
	intents: new Discord.Intents(46847)
});

console.log('Start index.js');

client.on('ready', require('./init'));

console.time('Client login');

client.login(process.env.TOKEN);
