import BaseCommand from '../../BaseClasses/BaseCommand.js';
import LangSingle from '../../BaseClasses/LangSingle.js';
import about from './about.json';
import { Client, Message, PartialMessage } from 'discord.js';
import { HandlerRepository } from './HandlerRepository';
import { Snowflake } from 'discord-api-types/v6';
import { Handler } from './Handler/Handler';

export class HandlerCommand extends BaseCommand {

	protected handlerRepository!: HandlerRepository;
	protected homeGuildId: Snowflake;

	public constructor (path: string) {
		super(path);

		this.category = 'Утилиты';
		this.name = 'handler';
		this.title = this.description = new LangSingle(about.title);

		// @ts-ignore
		const client: Client = global.client;
		// @ts-ignore
		this.homeGuildId = global.guild.id;

		// @ts-ignore @TODO: Надо бы уже избавиться от Promise в constructor
		return new Promise(async resolve => {
			this.handlerRepository = await HandlerRepository.init(client);

			if (this.handlerRepository.createMessageHandlerSet.size) {
				client.on('messageCreate', async (msg) => {
					await this.callMessageCreateHandlers(msg);
				});
			}

			if (this.handlerRepository.updateMessageHandlerSet.size) {
				client.on('messageUpdate', async (oldMsg, newMsg) => {
					await this.callMessageUpdateHandlers(oldMsg, newMsg);
				});
			}

			if (this.handlerRepository.deleteMessageHandlerSet.size) {
				client.on('messageDelete', async (msg) => {
					await this.callMessageDeleteHandlers(msg);
				});
			}

			resolve(this);
		});
	}


	protected validate (
		msg: Message
	): boolean {
		return msg.channel.type !== 'DM'
			&& msg.channel.guild.id === this.homeGuildId;
	}

	protected callMessageCreateHandlers (msg: Message) {
		if (this.validate(msg)) {
			this.handlerRepository.createMessageHandlerSet.forEach(handler => {
				if (handler.createMessagePerms.checkAllowed(msg)) {
					handler.createMessageHandle(msg)
						.catch(reason => this.handleError(handler, reason));
				}
			});
		}
	}

	protected callMessageUpdateHandlers (oldMsg: Message | PartialMessage, newMsg: Message | PartialMessage) {
		if (
			oldMsg instanceof Message && this.validate(oldMsg)
			&& newMsg instanceof Message && this.validate(newMsg)
		) {
			this.handlerRepository.updateMessageHandlerSet.forEach(handler => {
				if (handler.updateMessagePerms.checkAllowed(newMsg)) {
					handler.updateMessageHandle(oldMsg, newMsg)
						.catch(reason => this.handleError(handler, reason));
				}
			});
		}
	}

	protected callMessageDeleteHandlers (msg: Message | PartialMessage) {
		if (msg instanceof Message && this.validate(msg)) {
			this.handlerRepository.deleteMessageHandlerSet.forEach(handler => {
				if (handler.deleteMessagePerms.checkAllowed(msg)) {
					handler.deleteMessageHandle(msg)
						.catch(reason => this.handleError(handler, reason));
				}
			});
		}
	}

	protected async handleError (handler: Handler, reason: any) {
		const error: Error = reason instanceof Error ? reason : new Error(reason);

		// @ts-ignore
		const active = await error.handler('handler/' + handler.getName(), false);

		if (!active) {
			this.handlerRepository.shutdownHandler(handler);
		}
	}
}
