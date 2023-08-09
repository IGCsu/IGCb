const SlashOptions = require('../../BaseClasses/SlashOptions');
const BaseCommand = require('../../BaseClasses/BaseCommand');
const LangSingle = require('../../BaseClasses/LangSingle');
const {
	GuildMember,
	User,
  	Interaction,
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

			this.cardGenerator = UserLevelCards;
			this.cardGenerator.assets = UserLevelCards.loadAssets(path);

			resolve(this);
		});

	}


	/**
	 * Обработка команды
	 * Выдаёт статистику по пользовтаелю и ссылку на страницу
	 * @param  {CommandInteraction|UserContextMenuInteraction} int Команда
	 *   пользователя
	 * @param {GuildMember} member Объект пользователя
	 * @return {Promise<{content: InteractionReplyOptions|Object,
	 *   userLevel:UserLevels, type: string}|{error:string, type:string}>}
	 */
	async call (int, member) {

		const user = await new UserLevels(member, this.roles, this.rolesIDs);
		let type = 'reply';

		if (user.isAnimated() && !user.isGifCached()) {
			await int.deferReply();
			type = 'editReply'
		}

		if (!user.finded) return { error: 'Unknown User', type: type };

		const status = !commands.handler?.siteStatus;

		return {
			content: await preparedUiMessages.cardShowMessage(this.cardGenerator, user, status, int),
			userLevel: user,
			type: type
		};

	}


	/**
	 * Обработка слеш-команды
	 * @param {CommandInteraction} int Команда пользователя
	 */
	async slash (int) {
		const data = await this.call(
			int,
			int.options.getMember('user') ?? int.member
		);
		//if (data.userLevel.flags.animatedMediaContentEnabled || data.userLevel.flags.animatedAppearanceEnabled) {}

		if (data.error) {
			return int[data.type]({
				content: reaction.emoji.error + ' ' + int.str(data.error),
				ephemeral: true
			});
		}

		await int[data.type](data.content);

		if (!int.options.getMember('user') && data.userLevel.flags.bannerRemoved) {
			await this.followUpBannerAlert(int, data.userLevel);
		}
	}

	/**
	 * Обработка контекстной команды
	 * @param {UserContextMenuInteraction} int
	 */
	async contextUser (int) {
		const data = await this.call(int, int.targetMember);

		if (data.error) {
			return int[data.type]({
				content: reaction.emoji.error + ' ' + int.str(content.error),
				ephemeral: true
			});
		}

		data.content.ephemeral = true;
		await int.reply(data.content);

		if (int.targetMember == int.member && data.userLevel.flags.bannerRemoved) {
			await this.followUpBannerAlert(int, data.userLevel);
		}
	}

	/**
	 * Обработка кнопок команды
	 * @param {ButtonInteraction} int
	 */
	async button (int) {
		const params = int.customId.split('|');
		const btnType = params[1];
		let cardMessageId = params[3];
		const member = await guild.members.fetch(params[2]);
		const isMod = await this.permission(int.member);
		const userLevel = await new UserLevels(
		  member, this.roles, this.rolesIDs);
		let type = 'update';
		let defered = userLevel.isAnimated();

		if (defered) {
			if (btnType !== 'ready' && btnType !== 'hub' && btnType !== 'animatedMediaContent' && btnType !== 'animatedAppearance') {
				await int.deferUpdate();
			}

			if (btnType == 'hub') {
				await int.deferReply({ephemeral: true});
			}

			type = 'editReply';
		}

		switch (btnType) {
			case 'syncWithProfile': {
				userLevel.flags = { bannerSyncedWithDiscord: true };
				await userLevel.setBannerUrl(member.user.banner);
				return int[type](
				  await preparedUiMessages.bannerEphemeralActionSheet(
					int.client.users.cache.get(params[2]), userLevel,
					params[4], isMod, int.user, int
				  ));
			}
			case 'bannerMain': {
				await int[type](
				  await preparedUiMessages.bannerEphemeralActionSheet(
					int.client.users.cache.get(params[2]), userLevel,
					params[3], isMod, int.user, int
				  ));

				if (member.user == int.user && userLevel.flags.bannerRemoved) {
					await this.followUpBannerAlert(int, userLevel);
				}
				return;
			}
			case 'setCustom': {
				return int.showModal(
				  await preparedUiMessages.setCustomBannerModal(
					int.client.users.cache.get(params[2]),
					userLevel.getBannerUrl(), cardMessageId
				  ));
			}
			case 'remove': {
				userLevel.flags = {
					bannerRemoved: true,
					bannerSyncedWithDiscord: false
				};
				await userLevel.setBannerUrl(null);

				return int[type](
				  await preparedUiMessages.bannerEphemeralActionSheet(
					int.client.users.cache.get(params[2]), userLevel,
					cardMessageId, isMod, int.user, int
				  ));
			}
			case 'block': {
				userLevel.flags = { bannerBlocked: !userLevel.flags.bannerBlocked };
				await userLevel.setBannerUrl(null);
				return int.update(
				  await preparedUiMessages.bannerEphemeralActionSheet(
					int.client.users.cache.get(params[2]), userLevel,
					cardMessageId, isMod, int.user, int
				  ));
			}
			case 'ready': {
				await int.deferUpdate();
				await int.webhook.deleteMessage('@original');

				const message = await int.channel.messages.fetch(cardMessageId);
				return message.edit(
				  await preparedUiMessages.cardShowMessage(this.cardGenerator,
					userLevel, !commands?.handler?.siteStatus
				  ));
			}
			case 'hub': {
				if (!defered) type = 'reply';

				if (member.user != int.user && !isMod) {
					return int[type](
					  { content: 'Отказано в доступе', ephemeral: true });
				}

				return int[type](
				  await preparedUiMessages.hubEphemeralActionSheet(
					this.cardGenerator, userLevel, int.message.id))
			}
			case 'hubBack': {
				return int[type](
				  await preparedUiMessages.hubEphemeralActionSheet(
					this.cardGenerator, userLevel, cardMessageId))
			}
			case 'animatedMain': {
				return int[type](
				  await preparedUiMessages.animationsEphemeralActionSheet(
					this.cardGenerator, userLevel, cardMessageId, int
				  )
				);
			}
			case 'animatedMediaContent': {
				userLevel.flags = { animatedMediaContentEnabled: !userLevel.flags.animatedMediaContentEnabled };
				await userLevel.update();

				type = 'update'

				if(userLevel.flags.animatedMediaContentEnabled) {
					await int.deferUpdate();
					type = 'editReply';
				}

				return await int[type](
				  await preparedUiMessages.animationsEphemeralActionSheet(
					this.cardGenerator, userLevel, cardMessageId, int
				  )
				);
			}
			case 'animatedAppearance': {
				userLevel.flags = { animatedAppearanceEnabled: !userLevel.flags.animatedAppearanceEnabled };
				await userLevel.update();

				if(userLevel.isAnimated()) {
					await int.deferUpdate();
					type = 'editReply';
				}

				return await int[type](
				  await preparedUiMessages.animationsEphemeralActionSheet(
					this.cardGenerator, userLevel, cardMessageId
				  )
				);
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
		const cardMessageId = params[3];
		const member = await guild.members.fetch(params[2]);
        const isMod = await this.permission(int.member);
        const userLevel = await new UserLevels(member, this.roles, this.rolesIDs);

		switch (modalType) {
			case 'setCustomBanner': {
				userLevel.flags = { bannerSyncedWithDiscord: false };
				await userLevel.update();
				const url = int.components[0].components[0].value;
				if(url) {
					try {
						new URL(url);
					} catch (e) {
						return int.reply({
							content: 'Вы указали не ссылку!',
							ephemeral: true
						});
					}
				}
				await userLevel.setBannerUrl(url);
				return int.update(await preparedUiMessages.bannerEphemeralActionSheet(int.client.users.cache.get(params[2]), userLevel, cardMessageId, isMod, int.user))
			}
		}
	}

	/**
	 * Обработчик сообщений пользователя
	 * Мониторинг всех сообщений для начисления опыта пользователям.
	 * Игнорируются сообщения бота и в некоторых каналах.
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
	 * Отправляет follow up с предупреждением об удалении банера
	 * @param {ButtonInteraction|ModalSubmitInteraction|CommandInteraction} int
	 * @param {UserLevels} userLevel
	 */
	async followUpBannerAlert(int, userLevel) {
		let content = 'Ваш баннер был удалён модерацией.\nВ будущем вам может быть запрещён доступ к смене банера'

		if (userLevel.flags.bannerBlocked) content = 'Ваш баннер был удалён и заблокирован модерацией.\nВы больше не можете изменять свой баннер'

		await int.followUp({
			content: content,
			ephemeral: true
		})
		userLevel.flags = { bannerRemoved: false }
		await userLevel.update();
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
