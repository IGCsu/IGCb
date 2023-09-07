import { Handler } from './Handler';
import LangSingle from '../../../BaseClasses/LangSingle';
import { HandlerPermissions } from '../HandlerPermissions';
import { Message } from 'discord.js';

export class ElectionsReactionsHandler extends Handler {

	protected static instance: ElectionsReactionsHandler;

	public title = new LangSingle({
		ru: 'Прикрепление реакций ЗА и ПРОТИВ на выборах',
		en: 'Attaching reactions FOR and AGAINST in the elections',
		uk: 'Прикріплення реакцій ЗА та ПРОТИ на виборах'
	});

	public createMessagePerms = HandlerPermissions.init()
		.setAllowAllUsers(true)
		.setAllowChannel('612280548777525249');

	public static async init () {
		if (!this.instance) {
			this.instance = new ElectionsReactionsHandler();
		}

		return this.instance;
	}

	public async createMessageHandle (msg: Message): Promise<void> {
		if (!msg.content.startsWith('<@') || !msg.content.endsWith('>')) return;

		try {
			// @ts-ignore
			await msg.react(reaction.emoji.Sg3);
			// @ts-ignore
			await msg.react(reaction.emoji.Sg0);
		} catch (e) {}
	}

}
