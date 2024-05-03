import { Handler } from './Handler';
import LangSingle from '../../../BaseClasses/LangSingle';
import { HandlerPermissions } from '../HandlerPermissions';
import { Message } from 'discord.js';

export class LevelsHandler extends Handler {

	protected static instance: LevelsHandler;

	public title = new LangSingle({
		ru: 'Отлов сообщения для уровней',
		en: 'Catching a message for levels',
		uk: 'Вилов повідомлення для рівнів'
	});

	public createMessagePerms = HandlerPermissions.init()
		.setAllowAllUsers(true)
		.setAllowAllChannels(true, true);

	public static async init () {
		if (!this.instance) {
			this.instance = new LevelsHandler();
		}

		return this.instance;
	}

	public async createMessageHandle (msg: Message): Promise<void> {
		// @ts-ignore
		global.commands.levels.message(msg);
	}

}
