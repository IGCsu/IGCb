import dotenv from 'dotenv';
import { Client } from 'discord.js';
import { clientOptions } from './config/ClientOptions.js';
import { DB } from './libs/DB';
import { Router } from './libs/Router';

dotenv.config();

const client = new Client(clientOptions);

!async function () {
	await DB.init();
	await Router.init(client);
	await client.login(process.env.BOT_TOKEN);
}();