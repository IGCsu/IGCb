import { CommandInteraction, MessageEmbed } from 'discord.js';

/**
 * Валидный ответ клиенту
 */
export class Response extends Error {

	public async sendErrorMessage (int: CommandInteraction) {
		let embed = new MessageEmbed();

		embed.setDescription(this.message);
		embed.setColor('DARK_RED');

		const message = {
			embeds: [embed],
			ephemeral: true
		};

		int.deferred
			? await int.followUp(message)
			: await int.reply(message);
	}

}
