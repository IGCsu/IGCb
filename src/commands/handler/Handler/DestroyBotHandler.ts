import { Handler } from './Handler';
import LangSingle from '../../../BaseClasses/LangSingle';
import { HandlerPermissions } from '../HandlerPermissions';
import { Client, Message } from 'discord.js';

export class DestroyBotHandler extends Handler {

	protected static instance: DestroyBotHandler;

	public title: LangSingle = new LangSingle({
		ru: 'Прекращение работы бота при обнаружения запуска в другом месте',
		en: 'Bot terminates when it detects running elsewhere',
		uk: 'Припинення роботи робота при виявленні запуску в іншому місці'
	});

	public static async init (client: Client<true>) {
		if (!this.instance) {
			this.instance = new DestroyBotHandler();
			this.instance.createMessagePerms = HandlerPermissions.init()
				.setAllowUser(client.user.id)
				.setAllowBot()
				.setAllowChannel('574997373219110922');
		}

		return this.instance;
	}

	public async createMessageHandle (msg: Message): Promise<void> {
		if (msg.embeds[0]?.title != 'Бот запущен') return;
		// @ts-ignore
		if (msg.embeds[0]?.footer?.text == global.sessionId) return;

		await msg.reply({
			content: 'Прекращена работа бота-дубликата у ' +
				(process.env.USERNAME ?? 'Host')
		});

		console.error('Прекращение работы бота: бот запущен в другом месте');

		process.kill(process.pid);
	}

}
