import { AuditLogEvent, Client, Events } from 'discord.js';
import { Logger } from './Logger';

export class Router {

	/** Инициализирует слушателей */
	public static init (client: Client) {
		client.on(Events.ClientReady, () => this.ready(client));

		client.on(Events.InteractionCreate, async (int) => {
			const name = int.commandName ?? int.customId.split('|')[0];

			if (!CommandRepository.has(name)) return;

			const s = InteractionSession.init({ data: int });

			try {

				s.logger.info('Start "' + name + '" command', s.int.options.data);

				/** @see CommandRepository.list */
				await CommandRepository.get(name).func(s);

			} catch (err) {
				if (err instanceof UserError) {
					await err.sendErrorMessage(s);
					return;
				}

				s.logger.error(err.stack);
			}
		});

	}

	static ready (client) {
		CommandRepository.init(client);
		Logger.info('Bot ready!');
	}

}