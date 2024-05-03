import { BaseClass } from '../../../System/BaseClass';
import { TextBasedChannelFields, Webhook } from 'discord.js';

export class WebhookRepository extends BaseClass
{
	public constructor ()
	{
		super();
	}

	public async fetchOrCreateWebhook (
		channel: TextBasedChannelFields,
		webhookName: string,
		webhookOwnerId: string = ''
	): Promise<Webhook> {
		const webhooks = await channel.fetchWebhooks();

		let webhook = webhooks
			.filter(webhook => webhook.name === webhookName && webhook.owner?.id === webhookOwnerId)
			.first();

		if (!webhook) {
			this.logger.warn('Starboard webhook not found! Try create...');

			webhook = await channel.createWebhook(webhookName, {
				reason: 'Starboard webhook'
			});

			if (!webhook) {
				throw new Error('Can\'t create webhook for Starboard!');
			}
		}

		return webhook;
	}
}