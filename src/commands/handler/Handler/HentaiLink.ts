import { Handler } from './Handler';
import LangSingle from '../../../BaseClasses/LangSingle';
import { HandlerPermissions } from '../HandlerPermissions';
import { Message } from 'discord.js';

export class HentaiLink extends Handler {

	protected static instance: HentaiLink;

	protected readonly REGEXP: RegExp = /^[0-9]{2,}$/;

	public title: LangSingle = new LangSingle({
		ru: 'Преобразование кода в ссылку',
		en: 'Convert code to link',
		uk: 'Перетворення коду на посилання'
	});

	public createMessagePerms = HandlerPermissions.init()
		.setAllowAllUsers(true)
		.setAllowChannel('681790010550255617', true, true);

	public static async init () {
		if (!this.instance) {
			this.instance = new HentaiLink();
		}

		return this.instance;
	}

	public async createMessageHandle (msg: Message): Promise<void> {
		if (!this.REGEXP.test(msg.content)) return;
		if (msg.author.bot) return;

		await msg.reply({
			content: msg.author.toString() + ': https://nhentai.net/g/' + msg.content + '/',
			allowedMentions: { parse: [] }
		});
	}

}
