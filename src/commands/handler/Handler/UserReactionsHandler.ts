import { Handler } from './Handler';
import LangSingle from '../../../BaseClasses/LangSingle';
import { HandlerPermissions } from '../HandlerPermissions';
import { Message } from 'discord.js';

export class UserReactionsHandler extends Handler {

	protected static instance: UserReactionsHandler;

	protected readonly GLOBAL_EMOJI_REGEX: RegExp = /<:[^:]+:([0-9]+)>/gi;
	protected readonly LOCAL_EMOJI_REGEX: RegExp = /<:[^:]+:([0-9]+)>/i;

	public title = new LangSingle({
		ru: 'Прикрепление реакций найденных в сообщении',
		en: 'Attaching reactions found in the message',
		uk: 'Прикріплення реакцій знайдених у повідомленні'
	});

	public createMessagePerms = HandlerPermissions.init()
		.setAllowAllUsers(true)
		.setAllowChannel('572472723624951839');

	public static async init () {
		if (!this.instance) {
			this.instance = new UserReactionsHandler();
		}

		return this.instance;
	}

	public async createMessageHandle (msg: Message): Promise<void> {
		const emojis = msg.content.match(this.GLOBAL_EMOJI_REGEX);
		if (!emojis) return;
		if (!msg.guild) return;

		try {
			for (const emoji of emojis) {
				const matched = emoji.match(this.LOCAL_EMOJI_REGEX);
				if (!matched || !matched.length) return;

				const guildEmoji = msg.guild.emojis.cache.get(matched[0]);
				if (!guildEmoji) return;

				await msg.react(guildEmoji);
			}
		} catch (e) {}
	}

}
