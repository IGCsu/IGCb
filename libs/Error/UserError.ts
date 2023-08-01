import { Colors, EmbedBuilder } from 'discord.js';
import { InteractionSession } from '../Session/InteractionSession';

/**
 * Ошибка, которую мы кидаем, когда юзер хотим прервать работу скрипта
 * и вернуть юзеру текст ошибки
 */
export class UserError extends Error {

	public async sendErrorMessage (s: InteractionSession) {
		let embed = new EmbedBuilder();

		embed.setDescription(s._(this.message));
		embed.setColor(Colors.DarkRed);

		const message = {
			embeds: [embed],
			ephemeral: true
		};

		s.int.deferred
			? await s.int.followUp(message)
			: await s.int.reply(message);

		s.logger.info('UserError: ' + this.message);

		if (this.cause) {
			s.logger.warn(this.cause);
		}
	}

}