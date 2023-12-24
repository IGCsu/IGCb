import { BaseClass } from '../../../System/BaseClass';
import { Message, TextBasedChannelFields } from 'discord.js';

export class MessageRepository extends BaseClass
{
	public constructor ()
	{
		super();
	}

	public async fetchOrFailByIdFromChannel (messageId: string, channel: TextBasedChannelFields): Promise<Message>
	{
		// Либа всегда гарантирует Message?)
		// Очевидно пиздит, она тут не может такое гарантировать, потому проверяем всё равно
		const message = await channel.messages.fetch(messageId);

		if (!message) {
			throw new Error('Message ' + messageId + ' not found!');
		}

		return message;
	}
}