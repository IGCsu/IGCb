import LangSingle from '../../../BaseClasses/LangSingle';
import { HandlerPermissions } from '../HandlerPermissions';
import { Message } from 'discord.js';

export abstract class Handler {

	protected active: boolean = true;

	public abstract title: LangSingle;

	public createMessagePerms: HandlerPermissions = HandlerPermissions.init(false);
	public updateMessagePerms: HandlerPermissions = HandlerPermissions.init(false);
	public deleteMessagePerms: HandlerPermissions = HandlerPermissions.init(false);

	public isActive (): boolean {
		return this.active;
	}

	public getName (): string {
		return this.constructor.name;
	}

	public async createMessageHandle (msg: Message): Promise<void> {}

	public async updateMessageHandle (oldMsg: Message, newMsg: Message): Promise<void> {}

	public async deleteMessageHandle (msg: Message): Promise<void> {}

	public shutdown () {
		this.active = false;
	}

}