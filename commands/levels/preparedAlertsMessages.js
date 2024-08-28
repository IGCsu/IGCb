const preparedUiMessages = require('./preparedUIMessages');

/**
 * Отправляет follow up с предупреждением об удалении банера
 * @param {ButtonInteraction|ModalSubmitInteraction|CommandInteraction} int
 * @param {UserLevels} userLevel
 */
async function followUpBannerRemovedAlert(int, userLevel) {
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
 * Отправляет follow up с подсказкой о баннере из дискорда
 * @param {ButtonInteraction|ModalSubmitInteraction|CommandInteraction} int
 * @param {UserLevels} userLevel
 */
async function followUpBannerSyncAvailableAlert(int, userLevel) {
	let content = 'Обнаружен баннер в вашем профиле Дискорда!\nХотите добавить его в свою карточку уровня?'
	const cardMessageId = (await int.fetchReply()).id

	await int.followUp({
		content: content,
		ephemeral: true,
		components: [
			{
				type: 1, components: [
					{
						type: 2,
						style: 3,
						customId: 'levels|alert|' + userLevel.member.id + '|' + cardMessageId + '|syncBanner',
						label: 'Добавить',
					},
					{
						type: 2,
						style: 2,
						customId: 'levels|alert|' + userLevel.member.id + '|' + cardMessageId + '|ignore',
						label: 'Позже',
					},
					{
						type: 2,
						style: 2,
						customId: 'levels|alert|' + userLevel.member.id + '|' + cardMessageId + '|disableBannerSyncAlert',
						label: 'Никогда',
					},
				]
			}
		]
	})
}

/**
 * Отправляет follow up с подсказкой об анимированных карточках
 * @param {ButtonInteraction|ModalSubmitInteraction|CommandInteraction} int
 * @param {UserLevels} userLevel
 */
async function followUpAnimationsAvailableAlert(int, userLevel) {
	let content = 'Похоже у вас анимированный аватар или баннер.\nХотите включить анимированную карточку уровня? (Может потребоваться больше времени для генерации)'
	const cardMessageId = (await int.fetchReply()).id

	await int.followUp({
		content: content,
		ephemeral: true,
		components: [
			{
				type: 1, components: [
					{
						type: 2,
						style: 3,
						customId: 'levels|alert|' + userLevel.member.id + '|' + cardMessageId + '|enableAnimations',
						label: 'Включить',
					},
					{
						type: 2,
						style: 2,
						customId: 'levels|alert|' + userLevel.member.id + '|' + cardMessageId + '|ignore',
						label: 'Позже',
					},
					{
						type: 2,
						style: 2,
						customId: 'levels|alert|' + userLevel.member.id + '|'+ cardMessageId + '|disableAnimationsAlert',
						label: 'Никогда',
					},
				]
			}
		]
	})
}

async function handleAlerts(int, userLevel, cardGenerator) {
	const params = int.customId.split('|');
	const actionType = params[4];
	const cardMessageId = params[3];
	const member = await guild.members.fetch(params[2]);

	switch (actionType) {
		case 'syncBanner': {
			userLevel.flags = { bannerSyncedWithDiscord: true, alertBannerSyncAvailableNoticed: true };
			await userLevel.setBannerUrl(member.user.banner);

			await int.deferUpdate();
			await int.webhook.deleteMessage('@original');

			const message = await int.channel.messages.fetch(cardMessageId);
			return message.edit(
			  await preparedUiMessages.cardShowMessage(cardGenerator,
				userLevel, !commands?.handler?.siteStatus
			  ));
		}
		case 'enableAnimations': {
			userLevel.flags = { animatedMediaContentEnabled: true, alertAnimationsAvailableNoticed: true };
			await userLevel.update()

			await int.deferUpdate();
			await int.webhook.deleteMessage('@original');

			const message = await int.channel.messages.fetch(cardMessageId);
			return message.edit(
			  await preparedUiMessages.cardShowMessage(cardGenerator,
				userLevel, !commands?.handler?.siteStatus
			  ));
		}
		case 'disableBannerSyncAlert': {
			userLevel.flags = { alertBannerSyncAvailableNoticed: true };
			await userLevel.update()
			await int.deferUpdate();
			await int.webhook.deleteMessage('@original');
			break;
		}
		case 'disableAnimationsAlert': {
			userLevel.flags = { alertAnimationsAvailableNoticed: true };
			await userLevel.update()
			await int.deferUpdate();
			await int.webhook.deleteMessage('@original');
			break;
		}
		case 'ignore': {
			await int.deferUpdate();
			await int.webhook.deleteMessage('@original');
			break;
		}
	}
}


module.exports = {
	followUpBannerRemovedAlert,
	followUpBannerSyncAvailableAlert,
	followUpAnimationsAvailableAlert,
	handleAlerts
}