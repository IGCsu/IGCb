import { BaseClass } from '../../../System/BaseClass';
import { GuildBasedChannel } from 'discord.js';

export class ChannelRepository extends BaseClass
{
	public constructor ()
	{
		super();
	}

	public async fetchOrFailById (id: string): Promise<GuildBasedChannel>
	{
		const channel = await this.bot.getGuild().channels.fetch(id);

		if (channel === null) {
			throw new Error('Channel ' + id + ' not found!');
		}

		return channel;
	}
}