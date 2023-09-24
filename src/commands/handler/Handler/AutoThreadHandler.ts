import { Handler } from './Handler';
import LangSingle from '../../../BaseClasses/LangSingle';
import { HandlerPermissions } from '../HandlerPermissions';
import { Message } from 'discord.js';

export class AutoThreadHandler extends Handler {

	protected static instance: AutoThreadHandler;

	protected readonly REGEXP: RegExp = /^\*\*([^\n]+)\*\*\s*\n/i;

	public title: LangSingle = new LangSingle({
		ru: 'Автоматическое создание треда',
		en: 'Automatic thread creation',
		uk: 'Автоматичне створення треду'
	});

	public createMessagePerms = HandlerPermissions.init()
		.setAllowAllUsers(true)
		.setAllowBot()
		.setAllowChannel('500300930466709515')
		.setAllowChannel('595198087643922445');

	public static async init () {
		if (!this.instance) {
			this.instance = new AutoThreadHandler();
		}

		return this.instance;
	}

	public async createMessageHandle (msg: Message): Promise<void> {
		const match = msg.content.match(this.REGEXP);
		let title = '';

		if (match) {
			title += match[1];
		} else {
			if (!msg.member) return;

			const name = msg.member.toString();
			const time = new Date(msg.createdTimestamp).toJSON();
			title += name + ' ' + time;
		}

		await msg.startThread({ name: title });
	}

}
