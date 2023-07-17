require('dotenv').config();

console.time('Client initialized in');
global.Discord = require('discord.js');
global.client = new Discord.Client({
	intents: new Discord.Intents(46847)
});

console.log('Start index.js');

global.DB = new (require('sync-mysql'))({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_DATABASE,
	charset: 'utf8mb4'
});

client.on('ready', require('./init'));

console.time('Client login');

client.login(process.env.TOKEN);
