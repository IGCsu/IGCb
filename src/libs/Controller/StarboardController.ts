import { ControllerInterface } from './ControllerInterface';
import { ReactionEmojiEnum } from '../Discord/Reaction/Enum/ReactionEmojiEnum';
import { BaseGuildTextChannel, Message, TextChannel, Webhook } from 'discord.js';
import { BaseClass } from '../System/BaseClass';
import { WebhookRepository } from '../Discord/Webhook/Repository/WebhookRepository';
import { System } from '../System/System';
import { ChannelRepository } from '../Discord/Channel/Repository/ChannelRepository';
import { MessageRepository } from '../Discord/Message/Repository/MessageRepository';

export class StarboardController extends BaseClass implements ControllerInterface
{
	protected readonly REACTION_EMOJI = ReactionEmojiEnum.STAR;
	protected readonly COUNT = 7;
	protected readonly CHANNEL_ID = '938171284553101456';
	protected readonly CHANNEL_NAME = 'starboard';

	protected channelRepository: ChannelRepository;
	protected messageRepository: MessageRepository;
	protected webhookRepository: WebhookRepository;

	protected channel!: TextChannel;
	protected webhook!: Webhook;

	public constructor ()
	{
		super();

		this.channelRepository = System.get(ChannelRepository);
		this.messageRepository = System.get(MessageRepository);
		this.webhookRepository = System.get(WebhookRepository);
	}

	public async init (): Promise<void>
	{
		const channel = await this.channelRepository.fetchOrFailById(this.CHANNEL_ID);
		if (!(channel instanceof TextChannel)) {
			throw new Error('Starboard channel not text channel!');
		}

		this.webhook = await this.webhookRepository.fetchOrCreateWebhook(
			this.channel,
			this.CHANNEL_NAME,
			this.bot.getId()
		);

		this.bot.getClient().on('raw', async data => {
			if (data.t !== 'MESSAGE_REACTION_ADD') return;
			if (data.d.emoji.name !== this.REACTION_EMOJI) return;
			if (data.d.channel_id === this.CHANNEL_ID) return;

			try {
				await this.handleReactionAdd(data.d.channel_id, data.d.message_id);
			} catch (e) {
				this.logger.error(e, data);
			}
		});
	}

	protected async handleReactionAdd (channelId: string, messageId: string): Promise<void>
	{
		const channel = await this.channelRepository.fetchOrFailById(channelId);
		if (!(channel instanceof BaseGuildTextChannel)) {
			throw new Error('Channel type ' + channelId + ' does not match the BaseGuildTextChannel type!');
		}

		const message = await this.messageRepository.fetchOrFailByIdFromChannel(messageId, channel);

		const messageReaction = message.reactions.cache.get(this.REACTION_EMOJI);
		if (!messageReaction) {
			throw new Error('Message reaction not found!');
		}

		if (messageReaction.count < this.COUNT) return;

		const users = await messageReaction.users.fetch();

		if (users.get(this.bot.getId())) return;

		if (message.reference?.messageId) {
			let reference = await message.channel.messages
				.fetch(message.reference.messageId);
			await this.createMessage(reference, true);
		}

		await this.createMessage(message);

		await message.react(this.REACTION_EMOJI);
	}

	protected async createMessage (message: Message, reference: boolean = false): Promise<void>
	{
		// TODO: logic...
	}
}
