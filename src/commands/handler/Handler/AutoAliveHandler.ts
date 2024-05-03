import { Handler } from './Handler';
import LangSingle from '../../../BaseClasses/LangSingle';
import { HandlerPermissions } from '../HandlerPermissions';
import { Snowflake } from 'discord-api-types/v6';
import { Message, Role } from 'discord.js';

export class AutoAliveHandler extends Handler {

	protected static instance: AutoAliveHandler;

	protected readonly ROLE_ID: Snowflake = '648762974277992448';

	protected role!: Role;

	public title: LangSingle = new LangSingle({
		ru: 'Автоматическое выдача alive',
		en: 'Automatic issuance of alive',
		uk: 'Автоматичне видача alive'
	});

	public createMessagePerms = HandlerPermissions.init()
		.setRoleRequire(this.ROLE_ID, false)
		.setAllowAllUsers(true)
		.setAllowAllChannels();

	public static async init () {
		if (!this.instance) {
			this.instance = new AutoAliveHandler();
			// @ts-ignore
			this.instance.role = await guild.roles.fetch(this.ROLE_ID);
			if (!this.instance.role) {
				console.error('Role Alive not found');
				this.instance.active = false;
			}
		}

		return this.instance;
	}

	public async createMessageHandle (msg: Message): Promise<void> {
		await msg.member?.roles.add(this.role);
	}

}
