import { Handler } from './Handler/Handler';
import { Client } from 'discord.js';
import { AutoAliveHandler } from './Handler/AutoAliveHandler';
import { LevelsHandler } from './Handler/LevelsHandler';
import { ElectionsReactionsHandler } from './Handler/ElectionsReactionsHandler';
import { PingPromoterHandler } from './Handler/PingPromoterHandler';
import { UserReactionsHandler } from './Handler/UserReactionsHandler';
import { RuleHandler } from './Handler/RuleHandler';
import { AutoThreadHandler } from './Handler/AutoThreadHandler';
import { DestroyBotHandler } from './Handler/DestroyBotHandler';
import { HentaiLink } from './Handler/HentaiLink';

export class HandlerRepository {

	protected static instance: HandlerRepository;

	public createMessageHandlerSet: Set<Handler> = new Set();
	public updateMessageHandlerSet: Set<Handler> = new Set();
	public deleteMessageHandlerSet: Set<Handler> = new Set();

	public static async init (client: Client): Promise<HandlerRepository> {
		if (!this.instance) {
			this.instance = new HandlerRepository();

			this.instance.addHandler(await PingPromoterHandler.init());
			this.instance.addHandler(await UserReactionsHandler.init());
			this.instance.addHandler(await RuleHandler.init());
			this.instance.addHandler(await DestroyBotHandler.init(client));
			this.instance.addHandler(await AutoThreadHandler.init());
			this.instance.addHandler(await HentaiLink.init());
			this.instance.addHandler(await ElectionsReactionsHandler.init());
			this.instance.addHandler(await AutoAliveHandler.init());

			this.instance.addHandler(await LevelsHandler.init());
		}

		return this.instance;
	}

	protected addHandler (handler: Handler): void {
		if (!handler.isActive()) return;

		if (handler.createMessagePerms.isActive()) {
			this.createMessageHandlerSet.add(handler);
		}

		if (handler.updateMessagePerms.isActive()) {
			this.updateMessageHandlerSet.add(handler);
		}

		if (handler.deleteMessagePerms.isActive()) {
			this.deleteMessageHandlerSet.add(handler);
		}
	}

	public shutdownHandler (handler: Handler) {
		handler.shutdown();

		if (handler.createMessagePerms) {
			this.createMessageHandlerSet.delete(handler);
		}

		if (handler.updateMessagePerms) {
			this.updateMessageHandlerSet.delete(handler);
		}

		if (handler.deleteMessagePerms) {
			this.deleteMessageHandlerSet.delete(handler);
		}
	}
}