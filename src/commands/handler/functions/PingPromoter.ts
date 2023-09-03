import { Snowflake } from 'discord-api-types/v6';
import { Message, Role } from 'discord.js';

export class PingPromoter {

	protected static readonly ROLE_ID: Snowflake = '1107382381700206672';
	protected static readonly MONITORING_BOT_ID: Snowflake = '464272403766444044';
	protected static readonly COMMAND: string = '</up:891377101494681660>';
	protected static readonly TIMEOUT: number = 4 * 3600 * 1000;
	protected static role: Role;

	public static active: boolean = true;

	public static title = {
		ru: 'Автоматическое упоминание людей, готовых продвигать сервер',
		en: 'Automatic mention of people who are ready to promote the server',
		uk: 'Автоматичне згадування людей, що готові просувати сервер'
	};

	public static readonly allChannels: false;

	public static readonly allowedChannels = {
		'610371610620198922': false // #рандом
	};

	public static async init () {
		// @ts-ignore TODO: ебучие глобал переменные
		this.role = await guild.roles.fetch(this.ROLE_ID);
		if (this.role === undefined) {
			this.active = false;
		}
		return this;
	}

	public static async call (msg: Message) {
		if (msg?.member?.user.id !== this.MONITORING_BOT_ID) return;

		// @ts-ignore /functions/log.js
		initLog(msg, 'pingPromoter');
		// @ts-ignore
		const log = msg.log;
		// @ts-ignore /functions/sleep.js
		const sleep = global.sleep;

		let embed;
		for (let i = 0; i < 5; i++) {
			log('Fetch updated message. Try ' + i);

			await sleep(1000);

			try {
				const msgUpdated = await msg.channel.messages.fetch(msg.id);

				embed = msgUpdated.embeds[0];
			} catch (e) {
				log(e);
				return;
			}

			if (embed) {
				log('Embed found');
				break;
			}
		}

		if (!embed?.description?.includes('Успешный Up!')) {
			log('Embed is invalid. Description: ' + embed?.description);
			return;
		}

		log('Start sleep');
		await sleep(this.TIMEOUT);
		log('End sleep');

		await msg.channel.send(this.role.toString() + ' ' + this.COMMAND);
	}

}
