console.log('Start bot.js');

global.config = require('./config.json');
global.DB = new (require('sync-mysql'))(config.mysql);

global.Discord = require('discord.js');
global.client = new Discord.Client({ intents : new Discord.Intents(46847) });

client.on('ready', require('./init'));

console.time('Сlient login');
client.login(config.token);
