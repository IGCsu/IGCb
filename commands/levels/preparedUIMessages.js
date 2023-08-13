const { MessageAttachment, GuildMember, Snowflake } = require('discord.js');
const UserLevelCards = require('./UserLevelCard/UserLevelCard');
const UserLevels = require('./UserLevels');

/**
 *
 * @param {UserLevelCards} cardGenerator
 * @param {UserLevels} user
 * @param {boolean} status
 * @param {Interaction} int
 * @return {Promise<{components: [{components: [{style: number, disabled,
 *   label: string, type: number, url: string}], type: number},{components:
 *   [{style: number, disabled, label: string, type: number, url:
 *   string},{style: number, label: string, type: number, customId: string}],
 *   type: number}], files: *[]}>}
 */
async function cardShowMessage (cardGenerator, user, status, int) {

	console.time(`${user.member.id}: Сard generated in`);
	const attachment = await cardGenerator.generate(user, int);
	console.timeEnd(`${user.member.id}: Сard generated in`);
	const payoad = {
		content: null,
		files: [attachment],
		components: [
			{
				type: 1, components: [
					{
						type: 2,
						style: 5,
						url: constants.SITE_LINK + '/levels?id=' + user.member.id,
						label: 'Статистика пользователя',
						disabled: status
					}
				]
			},
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
						style: 1,
						customId: 'levels|hub|' + user.member.id,
						label: 'Управлять',
					},
				]
			},
		]
	};

	if (user.isAnimated() && user.isGifCached()) {
		payoad.content = attachment;
		payoad.files = null;
	}

	return payoad;
}

async function hubEphemeralActionSheet (cardGenerator, user, cardMessageId, int) {
	console.time(`${user.member.id}: Сard generated in`);
	const attachment = await cardGenerator.generate(user, int);
	console.timeEnd(`${user.member.id}: Сard generated in`);
	return {
		files: [attachment],
		ephemeral: true,
		content: '**Панель управления**',
		components: [
			{
				type: 1, components: [
					{
						type: 2,
						style: 1,
						customId: 'levels|animatedMain|' + user.member.id + '|' + cardMessageId,
						label: 'Анимации',
					},
					{
						type: 2,
						style: 1,
						customId: 'levels|bannerMain|' + user.member.id + '|' + cardMessageId,
						label: 'Баннер',
					},
				]
			},
		]
	};
}

async function animationsEphemeralActionSheet (cardGenerator, user, cardMessageId, int) {
	console.time(`${user.member.id}: Сard generated in`);
	const attachment = await cardGenerator.generate(user, int);
	console.timeEnd(`${user.member.id}: Сard generated in`);
	return {
		files: [attachment],
		ephemeral: true,
		content: '**Панель управления анимациями**',
		components: [
			{
				type: 1, components: [
					{
						type: 2,
						style: user.flags.animatedMediaContentEnabled ? 1 : 2,
						customId: 'levels|animatedMediaContent|' + user.member.id + '|' + cardMessageId,
						label: 'Аватар и Баннер',
					},
					{
						type: 2,
						style: user.flags.animatedAppearanceEnabled ? 1 : 2,
						customId: 'levels|animatedAppearance|' + user.member.id + '|' + cardMessageId,
						label: 'При появлении',
					},
				]
			},
			{
				type: 1, components: [
					{
						type: 2,
						style: 2,
						customId: 'levels|hubBack|' + user.member.id + '|' + cardMessageId,
						label: 'Назад',
					},
				  	{
						type: 2,
						style: 3,
						customId: 'levels|ready|' + user.member.id + '|' + cardMessageId,
						label: 'Применить',
					},
				]
			},
		]
	};
}

/**
 *
 * @param {User} user
 * @param {UserLevels} userLevel
 * @param {Snowflake} cardMessageId
 * @param {boolean} permission
 * @param {User} author
 * @returns {Promise<{components: [{components: [{style: number, disabled: *,
 *   label: string, type: number, customId: string}], type: number}],
 *   ephemeral: boolean, files: MessageAttachment[]}>}
 */
async function bannerEphemeralActionSheet (user, userLevel, cardMessageId, permission=false, author=undefined) {
	const guildUser = await user.fetch();
	let syncWithProfileTxt =  'Использовать из профиля';
	let setCustomTxt = 'Использовать кастомный';
	let bannerUrl = userLevel.getBannerUrl(true);
	let disableSyncWithProfile = false;

	if (userLevel.flags.bannerSyncedWithDiscord) {
		syncWithProfileTxt = 'Используется из профиля';
		disableSyncWithProfile = true;
	} else {
		if (bannerUrl) setCustomTxt = 'Изменить кастомный';
	}

	if (!guildUser.banner) {
		syncWithProfileTxt = 'Нет баннера в профиле'
		disableSyncWithProfile = true;
	}

	if(bannerUrl === guildUser.bannerURL()) {
		disableSyncWithProfile = true;
	} else {
		userLevel.flags = { bannerSyncedWithDiscord: false };
	}

	let bannerIsDefault = false;

	if (!bannerUrl) {
		bannerUrl = './commands/levels/UserLevelCard/assets/default_banner.png';
		bannerIsDefault = true;
	}

	const navigationComponents = {
		type: 1, components: [
			{
				type: 2,
				style: 2,
				customId: 'levels|hubBack|' + guildUser.id + '|' + cardMessageId,
				label: 'Назад',
			},
			{
				type: 2,
				style: 3,
				customId: 'levels|ready|' + guildUser.id + '|' + cardMessageId,
				label: 'Применить',
			},
		]
	};

	const modComponents = {
		type: 1, components: [
			{
				type: 2,
				style: 4,
				customId: 'levels|remove|' + guildUser.id + '|' + cardMessageId,
				label: 'Удалить баннер',
				disabled: bannerIsDefault
			},
			{
				type: 2,
				style: userLevel.flags.bannerBlocked ? 3 : 4,
				customId: 'levels|block|' + guildUser.id + '|' + cardMessageId,
				label: userLevel.flags.bannerBlocked ? 'Разблокировать баннер' : 'Удалить и заблокировать баннер',
				disabled: false
			},
		]
	}

	const blocked = userLevel.flags.bannerBlocked && author == userLevel.member.user

	const response = {
		content: '**Панель взаимодействия с баннером**\n> Текущий баннер:' + (blocked ? '\n\n**Вам запрещёно изменять свой баннер**' : ''),
		ephemeral: true,
		files: [new MessageAttachment(bannerUrl)],
		components: [
			{
				type: 1, components: [
					{
						type: 2,
						style: 1,
						customId: 'levels|syncWithProfile|' + guildUser.id + '|' + (guildUser.banner ?? '') + '|' + cardMessageId,
						label: syncWithProfileTxt,
						disabled: disableSyncWithProfile || blocked
					},
					{
						type: 2,
						style: 1,
						customId: 'levels|setCustom|' + guildUser.id + '|' + cardMessageId,
						label: setCustomTxt,
						disabled: blocked
					},
				]
			},
		]
	};

	if(permission) response.components.push(modComponents);
	response.components.push(navigationComponents);
	return response;
}

/**
 *
 * @param {User} user
 * @param {string} bannerUrl
 * @param {Snowflake} cardMessageId
 * @returns {Promise<{components: [{components: [{min_length: number, style:
 *   number, label: string, placeholder: string, type: number, customId:
 *   string, value: *, required: boolean}], type: number}], title: string,
 *   customId: string}>}
 */
async function setCustomBannerModal (user, bannerUrl=undefined, cardMessageId) {
	const guildUser = await user.fetch();

	return {
		title: 'Смена баннера',
		customId: 'levels|setCustomBanner|' + guildUser.id + '|' + cardMessageId,
		components: [
			{
				type: 1, components: [
					{
						type: 4,
						style: 1,
						customId: 'levels|setCustomBanner|url',
						label: 'Ссылка на банер',
						min_length: 15,
						value: bannerUrl,
						placeholder: "Оставьте пустым чтобы вернуть стандартный баннер",
						required: false
					},
				]
			},
		]
	};
}

module.exports = {
	cardShowMessage,
	bannerEphemeralActionSheet,
	setCustomBannerModal,
	hubEphemeralActionSheet,
	animationsEphemeralActionSheet
}
