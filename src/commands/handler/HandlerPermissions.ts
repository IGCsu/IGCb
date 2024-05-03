import { Snowflake } from 'discord-api-types/v6';
import { GuildBasedChannel, GuildMemberRoleManager, Message, User } from 'discord.js';

interface Rights {
	[key: Snowflake]: boolean;
}

export class HandlerPermissions {

	protected botRight: boolean = false;

	protected allUsers: boolean = false;
	protected allChannels: boolean = false;
	protected allChannelThreads: boolean = false;

	protected rolesRights: Rights = {};
	protected usersRights: Rights = {};
	protected channelsRights: Rights = {};
	protected channelThreadsRights: Rights = {};

	protected constructor (
		protected active: boolean = true
	) {}

	public static init (active: boolean = true): HandlerPermissions {
		return new HandlerPermissions(active);
	}

	/** Проверка доступности вызова */
	public checkAllowed (msg: Message): boolean {
		if (!this.active) return false;
		if (msg.channel.type === 'DM') return false;

		const isThread = msg.channel.isThread();
		const channel = isThread ? msg.channel.parent : msg.channel;

		if (!channel || !this.checkAllowedChannel(channel, isThread)) return false;

		const member = msg.member;

		if (!member || !member.user || !member.roles) {
			return false;
		}

		if (!this.checkAllowedUser(member.user)) {
			return false;
		}

		return this.checkAllowedRoles(member.roles);
	}

	/** Allowed **/

	/** Возможность проверки прав */
	public isActive (): boolean {
		return this.active;
	}

	/**
	 * Проверка доступности вызова по роли.
	 *
	 * Возвращает false - если:
	 * * у текущего юзера роль, которой не должно быть.
	 * * у текущего юзера нет роли, которая требуется.
	 */
	public checkAllowedRoles (roles: GuildMemberRoleManager): boolean {
		for (const roleId in this.rolesRights) {
			if (roles.cache.has(roleId) !== this.rolesRights[roleId]) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Проверка доступности вызова по юзеру.
	 *
	 * Возвращает false - если:
	 * * текущий юзер - бот, а ботам запрещено.
	 * * текущему юзеру запрещено.
	 * * всем юзерам запрещено, а текущему не разрешено.
	 */
	public checkAllowedUser (user: User): boolean {
		if (user.bot && !this.botRight) {
			return false;
		}

		if (this.usersRights.hasOwnProperty(user.id)) {
			return this.usersRights[user.id];
		}

		return this.allUsers;
	}

	/**
	 * Проверка доступности вызова по каналу.
	 *
	 * Возвращает false - если:
	 * * сообщение в канале или категории, которые запрещён.
	 * * запрещено везде, а текущий канал или категория не разрешены.
	 * * сообщение в треде, когда тред для этого канала или категории запрещены.
	 * * запрещены треды везде, а треды в текущем канале или категории не разрешены.
	 *
	 * Важные нюансы:
	 * * Не может быть разрешения на тред, но запрет на канал треда.
	 * * Права на канал приоритетнее прав на категорию.
	 */
	public checkAllowedChannel (channel: GuildBasedChannel, isThread: boolean = false): boolean {
		if (isThread && this.channelThreadsRights.hasOwnProperty(channel.id)) {
			return this.channelThreadsRights[channel.id];
		}

		if (this.channelsRights.hasOwnProperty(channel.id)) {
			return this.channelsRights[channel.id];
		}

		if (channel.parentId) {
			if (isThread && this.channelThreadsRights.hasOwnProperty(channel.parentId)) {
				return this.channelThreadsRights[channel.parentId];
			}

			if (this.channelsRights.hasOwnProperty(channel.parentId)) {
				return this.channelsRights[channel.parentId];
			}
		}

		return isThread ? this.allChannelThreads : this.allChannels;
	}

	/** allowAll **/

	/** Установка разрешения для всех пользователей */
	public setAllowAllUsers (allow: boolean = true): HandlerPermissions {
		this.allUsers = allow;
		return this;
	}

	/** Установка разрешения во все каналы и все треды */
	public setAllowAllChannels (
		allow: boolean = true,
		allowThreads: boolean = false
	): HandlerPermissions {
		this.allChannels = allow;
		this.allChannelThreads = allow && allowThreads;
		return this;
	}

	/** allow **/

	/** Установка требования наличия или отсутствия роли для разрешения */
	public setRoleRequire (id: Snowflake, needed: boolean = true): HandlerPermissions {
		this.rolesRights[id] = needed;
		return this;
	}

	/** Установка разрешения для юзера */
	public setAllowUser (id: Snowflake, allow: boolean = true): HandlerPermissions {
		this.usersRights[id] = allow;
		return this;
	}

	/** Установка разрешения для канала и тредов */
	public setAllowChannel (
		id: Snowflake,
		allow: boolean = true,
		allowThreads: boolean = false
	): HandlerPermissions {
		this.channelsRights[id] = allow;
		this.channelThreadsRights[id] = allow && allowThreads;
		return this;
	}

	/** Установка разрешения для ботов */
	public setAllowBot (allow: boolean = true): HandlerPermissions {
		this.botRight = allow;
		return this;
	}

}