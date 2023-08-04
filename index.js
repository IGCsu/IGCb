console.time('Client initialized in');

require('dotenv').config();

console.time('Client initialized in');
global.Discord = require('discord.js');
global.client = new Discord.Client({
	intents: new Discord.Intents(46847)
});

console.log('Start index.js');

const mysql = require('mysql2/promise');
const util = require('util');

const connection = mysql.createConnection({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_DATABASE,
	charset: 'utf8mb4'
});

global.DB = {
	query: async (sql, values=undefined) => {
		const [rows, fields] = await (await connection).query(sql, values);
		return rows;
	}
};

client.on('ready', require('./init'));

console.time('Client login');

client.login(process.env.TOKEN);
