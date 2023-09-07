import { Handler } from './Handler';
import LangSingle from '../../../BaseClasses/LangSingle';
import { HandlerPermissions } from '../HandlerPermissions';
import { Rules, SiteClient } from '../../../libs/Site/SiteClient';
import { Message } from 'discord.js';

export class RuleHandler extends Handler {

	protected static instance: RuleHandler;

	protected siteClient!: SiteClient;

	protected rules: Rules = {};

	public title = new LangSingle({
		ru: 'Отправляет текст пункта Устава',
		en: 'Sends the text of the clause of the Charter',
		uk: 'Надсилає текст пункту Статуту'
	});

	public createMessagePerms = HandlerPermissions.init()
		.setAllowAllUsers(true)
		.setAllowAllChannels(true, true);

	public static async init () {
		if (!this.instance) {
			this.instance = new RuleHandler();
			this.instance.siteClient = await SiteClient.init();

			this.instance.rules = await this.instance.siteClient.fetchRules();

			if (!this.instance.rules) {
				console.error('Error fetch rules from site');
				this.instance.active = false;
			}
		}

		return this.instance;
	}

	public async createMessageHandle (msg: Message): Promise<void> {
		if (msg.content.length < 2) return;

		const ruleKey = msg.content
			.replace('а', 'a')
			.replace(/^r\.?/, '');

		if (!this.rules.hasOwnProperty(ruleKey)) return;

		await msg.reply({
			content: this.siteClient.buildRuleUrl(ruleKey),
			allowedMentions: { parse: [] }
		});
	}

}
