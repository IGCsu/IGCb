console.log('Start bot.js');

global.config = require('./config.json');
global.DB = new (require('sync-mysql'))(config.mysql);

global.Discord = require('discord.js');
global.client = new Discord.Client({ intents : new Discord.Intents(6143) });
global.predict_name = ''; //Shit code

client.on('ready', require('./init'));

console.time('Сlient login');
client.login(config.token);
