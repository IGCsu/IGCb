import { MessageEmbed } from 'discord.js';

export class DiplomacyResponse {

	public constructor (
		public embeds: MessageEmbed[],
		public pingList: string
	) {
		this.embeds = embeds;
		this.pingList = pingList;
	}

}
