const SlashOptions = require('../../BaseClasses/SlashOptions');
const BaseCommand = require('../../BaseClasses/BaseCommand');
const LangSingle = require('../../BaseClasses/LangSingle');
const {
	GuildMember,
	User,
	CommandInteraction,
	UserContextMenuInteraction,
	ButtonInteraction,
	ModalSubmitInteraction,
	InteractionReplyOptions
} = require('discord.js');

const slashOptions = require('./slashOptions');
const { title, description } = require('./about.json');
const noXPChannels = require('./noXPChannels.json');
const UserLevels = require('./UserLevels');
const UserLevelCards = require('./UserLevelCard/UserLevelCard');
const preparedUiMessages = require('./preparedUIMessages');

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

		this.name = 'levels';
		this.title = new LangSingle(title);
		this.description = new LangSingle(description);
		this.slashOptions = slashOptions;



		return new Promise(async resolve => {
			this.roles = await DB.query('SELECT * FROM levels_roles');
			this.roles.sort((a, b) => b.value - a.value);
			this.rolesIDs = [];

			for (let r = 0; r < this.roles.length; r++) {
				this.roles[r].pos = r;
				this.roles[r].cache = guild.roles.cache.get(this.roles[r].id);
				if (this.roles[r].id === '648762974277992448') continue;
				this.rolesIDs.push(this.roles[r].id);
			}

			this.cardGenerator = new UserLevelCards(path);

			resolve(this);
		});

	}


	/**
	 * Обработка команды
	 * Выдаёт статистику по пользовтаелю и ссылку на страницу
	 * @param  {CommandInteraction|UserContextMenuInteraction} int Команда пользователя
	 * @param {GuildMember} member Объект пользователя
	 * @return {InteractionReplyOptions|Object}
	 */
	async call (int, member) {

		const user = await new UserLevels(member, this.roles, this.rolesIDs);

		if (!user.finded) return { error: 'Unknown User' };

		const status = !commands.handler?.siteStatus;

		return preparedUiMessages.cardShowMessage(this.cardGenerator, user, status);

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
	 * Обработка кнопок команды
	 * @param {ButtonInteraction} int
	 */
	async button (int) {
		const params = int.customId.split('|');
		const btnType = params[1];
        const member = await guild.members.fetch(params[2]);
		const isMod = await this.permission(int.member);
        let userLevel = await new UserLevels(member, this.roles, this.rolesIDs);

		switch (btnType) {
			case 'syncWithProfile': {
				userLevel.flags = { bannerSyncedWithDiscord: true };
                await userLevel.setBannerUrl(member.user.bannerURL({format: 'png', size: 4096}));
				console.log(userLevel.flags)
				return int.update(await preparedUiMessages.bannerEphemeralActionSheet(int.client.users.cache.get(params[2]), userLevel))
			}
			case 'bannerMain': {
				if (member.user != int.user && !isMod) return int.reply({content: 'Отказано в доступе', ephemeral: true})

				await int.reply(await preparedUiMessages.bannerEphemeralActionSheet(int.client.users.cache.get(params[2]), userLevel, isMod))

				if (member.user == int.user && userLevel.flags.bannerRemoved) {
					await int.followUp({
						content: 'Ваш баннер был удалён модерацией.\nВ будущем вам может быть запрещён доступ к смене банера',
						ephemeral: true
					})
					userLevel.flags = {bannerRemoved: false}
					await userLevel.update();
				}
				return;
			}
			case 'setCustom': {
				return int.showModal(await preparedUiMessages.setCustomBannerModal(int.client.users.cache.get(params[2])))
			}
			case 'remove': {
				userLevel.flags = {bannerRemoved: true}
				userLevel = await userLevel.setBannerUrl(null)
				return int.update(preparedUiMessages.bannerEphemeralActionSheet(int.client.users.cache.get(params[2]), userLevel, isMod))
			}
			case 'block': {
				userLevel.flags = {bannerBlocked: !userLevel.flags.bannerBlocked}
				userLevel = await userLevel.setBannerUrl(null)
				return int.update(preparedUiMessages.bannerEphemeralActionSheet(int.client.users.cache.get(params[2]), userLevel, isMod))
			}

		}
	}

	/**
	 *
	 * @param {ModalSubmitInteraction}int
	 * @returns {Promise<GuildCacheMessage<Cached>|void|void>}
	 */
	async modal (int) {
		const params = int.customId.split('|');
		const modalType = params[1];
        const isMod = await this.permission(int.member);
        const userLevel = await new UserLevels(int.member, this.roles, this.rolesIDs);

		switch (modalType) {
			case 'setCustomBanner': {
				const url = int.components[0].components[0].value;
				try {
					new URL(url);
				} catch (e) {
					return int.reply('Вы указали не ссылку!')
				}
				await userLevel.setBannerUrl(url);
				return int.update(await preparedUiMessages.bannerEphemeralActionSheet(int.client.users.cache.get(params[2]), userLevel, isMod))
			}
		}
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

		let user = await new UserLevels(msg.member, this.roles, this.rolesIDs, true);

		(await user.userMessageCounting(msg)
			.update())
			.updateRole();
	}

	/**
	 *
	 * @param {User|GuildMember} user
	 */
	async permission(user){
		if (user instanceof User)
				user = await guild.members.fetch(user.id);
		if (!(user instanceof GuildMember))
			return false;

		return user.roles.cache.hasAny(
		  ...[
			'613412133715312641',
			'916999822693789718',
			'920407448697860106'
		  ]
		)

	}
}

module.exports = Levels;
