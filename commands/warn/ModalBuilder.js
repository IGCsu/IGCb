const { MessageEmbed, Modal } = require('discord.js');

class ModalBuilder {

	/**
	 * Модалка нового варна
	 * @param {CommandInteraction|UserContextMenuInteraction} int
	 * @param {Snowflake|string} targetId
	 * @return {Modal}
	 */
	static newWarn (int, targetId) {
		return new Modal({
			title: 'Новый варн',
			custom_id: `warn|NewWarnModal|${targetId}`,
			components: [
				{
					type: 1,
					components: [
						{
							type: 4,
							style: 2,
							custom_id: 'reason',
							label: 'Причина',
							required: false,
							placeholder: '1.2, 1.10'
						}
					]
				}
			]
		});
	}

	/**
	 * Модалка изменения причины Варна
	 * @param {ButtonInteraction} int
	 * @param {Warn} warn
	 * @return {Modal}
	 */
	static editWarn (int, warn) {
		return new Modal({
			title: 'Изменение варна №' + warn.id,
			custom_id: `warn|EditWarnModal|${warn.id}`,
			components: [
				{
					type: 1,
					components: [
						{
							type: 4,
							style: 2,
							custom_id: 'reason',
							label: 'Причина',
							required: false,
							value: warn.reason,
							placeholder: '1.2, 1.10'
						}
					]
				}
			]
		});
	}

}

module.exports = ModalBuilder;