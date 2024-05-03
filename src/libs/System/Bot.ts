import { Client, Guild } from 'discord.js';

export class Bot
{
	public getClient (): Client<true>
	{
		// @ts-ignore
		return global.client;
	}

	public getId (): string
	{
		return this.getClient().user.id;
	}

	public getGuild (): Guild
	{
		// @ts-ignore
		return global.guild;
	}
}