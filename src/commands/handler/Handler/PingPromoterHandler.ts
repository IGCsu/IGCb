import { Snowflake } from 'discord-api-types/v6';
import { Message, Role } from 'discord.js';
import { Handler } from './Handler';
import LangSingle from '../../../BaseClasses/LangSingle';
import { HandlerPermissions } from '../HandlerPermissions';

export class PingPromoterHandler extends Handler {

	protected static instance: PingPromoterHandler;

	protected readonly ROLE_ID: Snowflake = '1107382381700206672';
	protected readonly MONITORING_BOT_ID: Snowflake = '464272403766444044';
	protected readonly COMMAND: string = '</up:891377101494681660>';
	protected readonly TIMEOUT: number = 4 * 3600 * 1000;
	protected role!: Role;

	public title = new LangSingle({
		ru: 'Автоматическое упоминание людей, готовых продвигать сервер',
		en: 'Automatic mention of people who are ready to promote the server',
		uk: 'Автоматичне згадування людей, що готові просувати сервер'
	});

	public updateMessagePerms = HandlerPermissions.init()
		.setAllowAllUsers(true)
		.setAllowBot()
		.setAllowChannel('610371610620198922');

	public static async init () {
		if (!this.instance) {
			this.instance = new PingPromoterHandler();

			// @ts-ignore TODO: ебучие глобал переменные
			this.instance.role = await guild.roles.fetch(this.ROLE_ID);
			if (!this.instance.role) {
				console.error('Role Promoter not found');
				this.instance.active = false;
			}
		}

		return this.instance;
	}

	public async updateMessageHandle (msg: Message): Promise<void> {
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
