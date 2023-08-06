const { MessageAttachment, GuildMember } = require('discord.js');
const UserLevelCards = require('./UserLevelCard/UserLevelCard');
const UserLevels = require('./UserLevels');

/**
 *
 * @param {UserLevelCards}cardGenerator
 * @param {UserLevels}user
 * @param {boolean}status
 * @return {Promise<{components: [{components: [{style: number, disabled, label: string, type: number, url: string}], type: number},{components: [{style: number, disabled, label: string, type: number, url: string},{style: number, label: string, type: number, customId: string}], type: number}], files: *[]}>}
 */
async function cardShowMessage (cardGenerator, user, status) {
	return {
		files: [await cardGenerator.generate(user)],
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
						customId: 'levels|bannerMain|' + user.member.id,
						label: 'Баннер',
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
 * @param {boolean} permission
 * @returns {{components: [{components: [{style: number, disabled: *, label: string, type: number, customId: string}], type: number}], ephemeral: boolean, files: MessageAttachment[]}}
 */
async function bannerEphemeralActionSheet (user, userLevel, permission=false) {
	const guildUser = await user.fetch();
	let syncWithProfileTxt =  'Использовать из профиля';
	let setCustomTxt = 'Использовать кастомный';
	let bannerUrl = userLevel.getBannerUrl();
	let disableSyncWithProfile = false;

	if (userLevel.flags.bannerSyncedWithDiscord) {
		syncWithProfileTxt = 'Используется из профиля';
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

	const modComponents = {
		type: 1, components: [
			{
				type: 2,
				style: 4,
				customId: 'levels|remove|' + guildUser.id,
				label: 'Удалить баннер',
				disabled: bannerIsDefault
			},
			{
				type: 2,
				style: userLevel.flags.bannerBlocked ? 3 : 4,
				customId: 'levels|block|' + guildUser.id,
				label: userLevel.flags.bannerBlocked ? 'Разблокировать баннер' : 'Удалить и заблокировать баннер',
				disabled: false
			},
		]
	}

	const blocked = userLevel.flags.bannerBlocked && guildUser == userLevel.member.user

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
						customId: 'levels|syncWithProfile|' + guildUser.id + '|' + (guildUser.banner ?? ''),
						label: syncWithProfileTxt,
						disabled: disableSyncWithProfile || blocked
					},
					{
						type: 2,
						style: 2,
						customId: 'levels|setCustom|' + guildUser.id,
						label: setCustomTxt,
						disabled: blocked
					},
				]
			},
		]
	};

	if(permission) response.components.push(modComponents);

	return response;
}

/**
 *
 * @param {User} user
 * @param {string} bannerUrl
 * @returns {Promise<{components: [{components: [{min_length: number, style: number, label: string, placeholder: string, type: number, customId: string, value: *, required: boolean}], type: number}], title: string, customId: string}>}
 */
async function setCustomBannerModal (user, bannerUrl=undefined) {
	const guildUser = await user.fetch();

	return {
		title: 'Смена баннера',
		customId: 'levels|setCustomBanner|' + guildUser.id,
		components: [
			{
				type: 1, components: [
					{
						type: 4,
						style: 1,
						customId: 'levels|setCustomBanner|url',
						label: 'Ссылка на банер',
						min_length: 15,
						value: bannerUrl ?? guildUser.bannerURL(),
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
	setCustomBannerModal
}
