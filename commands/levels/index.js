const SlashOptions = require('../../BaseClasses/SlashOptions');
const BaseCommand = require('../../BaseClasses/BaseCommand');
const LangSingle = require('../../BaseClasses/LangSingle');
const {
	GuildMember,
	CommandInteraction,
	UserContextMenuInteraction,
	InteractionReplyOptions
} = require('discord.js');

const slashOptions = require('./slashOptions');
const { title, description } = require('./about.json');
const noXPChannels = require('./noXPChannels.json');
const UserLevels = require('./UserLevels');

class Levels extends BaseCommand {

	/**
	 * Массив ID каналов, в которых сообщения не засчитываются
	 * @type {string[]}
	 */
	noXPChannels = noXPChannels;

	/**
	 * Массив уровней
	 * @type {Object[]}
	 */
	roles = [];

	/**
	 * Массив ID ролей уровней. Используется для поиска.
	 * @type {string[]}
	 */
	rolesIDs = [];

	constructor (path) {
		super(path);

		this.category = 'Информация';
		
		// TODO: Модулю пизда: отвалилась БД
		this.active = false;

		this.name = 'levels';
		this.title = new LangSingle(title);
		this.description = new LangSingle(description);
		this.slashOptions = slashOptions;

		this.roles = DB.query('SELECT * FROM levels_roles');
		this.roles.sort((a, b) => b.value - a.value);
		this.rolesIDs = [];

		for (let r = 0; r < this.roles.length; r++) {
			this.roles[r].pos = r;
			this.roles[r].cache = guild.roles.cache.get(this.roles[r].id);
			if (this.roles[r].id === '648762974277992448') continue;
			this.rolesIDs.push(this.roles[r].id);
		}

		return new Promise(async resolve => {
			resolve(this);
		});

	}


	/**
	 * Обработка команды
	 * Выдаёт статистику по пользовтаелю и ссылку на страницу
	 * @param  {CommandInteraction|UserContextMenuInteraction} int Команда
	 *   пользователя
	 * @param {GuildMember} member Объект пользователя
	 * @return {InteractionReplyOptions|Object}
	 */
	async call (int, member) {

		const user = new UserLevels(member, this.roles, this.rolesIDs);

		if (!user.finded) return { error: 'Unknown User' };

		const embed = user.getEmbed();

		const status = !commands.handler && !commands.handler.siteStatus;

		return {
			embeds: [embed],
			components: [
				{
					type: 1, components: [
						{
							type: 2,
							style: 5,
							url: constants.SITE_LINK + '/levels',
							label: 'Таблица',
							disabled: status
						},
						{
							type: 2,
							style: 5,
							url: constants.SITE_LINK + '/levels?id=' + user.member.id,
							label: 'Статистика пользователя',
							disabled: status
						}
					]
				}
			]
		};

	}


	/**
	 * Обработка слеш-команды
	 * @param {CommandInteraction} int Команда пользователя
	 */
	async slash (int) {
		const content = await this.call(
			int,
			int.options.getMember('user') ?? int.member
		);

		if (content.error) {
			return int.reply({
				content: reaction.emoji.error + ' ' + int.str(content.error),
				ephemeral: true
			});
		}

		int.reply(content);
	}

	/**
	 * Обработка контекстной команды
	 * @param {UserContextMenuInteraction} int
	 */
	async contextUser (int) {
		const content = await this.call(int, int.targetMember);

		if (content.error) {
			return int.reply({
				content: reaction.emoji.error + ' ' + int.str(content.error),
				ephemeral: true
			});
		}

		content.ephemeral = true;
		int.reply(content);
	}


	/**
	 * Обработчик сообщений пользователя
	 * Мониторинг всех сообщений для начисления опыта пользователям. Игнорируются
	 * сообщения бота и в некоторых каналах.
	 * @param {Message} msg Сообщение пользователя
	 */
	async message (msg) {
		if (msg.author.bot) return;
		const channel = msg.channel.isThread() ? msg.channel.parent : msg.channel;
		if (!channel) return;
		if (this.noXPChannels.includes(channel.parentId)) return;
		if (this.noXPChannels.includes(channel.id)) return;

		let user = new UserLevels(msg.member, this.roles, this.rolesIDs, true);

		user.userMessageCounting(msg)
			.update()
			.updateRole();
	}

}

module.exports = Levels;
