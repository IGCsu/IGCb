const {MessageEmbed} = require("discord.js");

class EmbedBuilder {

	/**
	 * Эмбед отсутствия прав
	 * @param {boolean} [ephemeral=false]
	 * @return {Object<InteractionReplyOptions>}
	 */
	static noPermissions(ephemeral){
		if(!ephemeral) ephemeral = false;

		const embed = new MessageEmbed({
			title: reaction.emoji.error + 'У вас недостаточно прав для совершения этого действия',
			color: reaction.color.error
		});

		return this.#getReplyOptions(embed, ephemeral);
	}

	/**
	 * Эмбед отсутствия варна
	 * @param {boolean} [ephemeral=false]
	 * @return {Object<InteractionReplyOptions>}
	 */
	static noSuchWarn(ephemeral){
		if(!ephemeral) ephemeral = false;

		const embed = new MessageEmbed({
			title: reaction.emoji.error + ' Такого варна не существует',
			color: reaction.color.error
		});

		return this.#getReplyOptions(embed, ephemeral);
	}

	/**
	 * Эмбед отсутствия варнов у пользователя
	 * @param {boolean} [ephemeral=false]
	 * @return {Object<InteractionReplyOptions>}
	 */
	static noWarns(ephemeral){
		if(!ephemeral) ephemeral = false;

		const embed = new MessageEmbed({
			title: 'У этого пользователя отсутствуют варны',
			color: reaction.color.blurple
		});

		return this.#getReplyOptions(embed, ephemeral);
	}

	/**
	 * Эмбед созданного варна
	 * @param {ModalSubmitInteraction|ButtonInteraction} int
	 * @param {Warn} warn
	 * @param {boolean} [ephemeral=false]
	 * @return {Object<InteractionReplyOptions>}
	 */
	static async newWarn(int, warn, ephemeral){
		if(!ephemeral) ephemeral = false;
		const target = await warn.getTarget();

		const embed = new MessageEmbed({
			title: `${reaction.emoji.success} | Варн номер ${warn.id} был выдан пользователю ${target.tag}`,
			color: reaction.color.success
		});

		return this.#getReplyOptions(embed, ephemeral);
	}

	/**
	 * Эмбед отредактированного варна
	 * @param {ModalSubmitInteraction|ButtonInteraction} int
	 * @param {Warn} warn
	 * @param {boolean} [ephemeral=false]
	 * @return {Object<InteractionReplyOptions>}
	 */
	static async editWarn(int, warn, ephemeral){
		const embed = new MessageEmbed({
			title: `${reaction.emoji.success} | Причина варна номер ${warn.id} была изменина на: ${warn.reason}`,
			color: reaction.color.success
		});

		return this.#getReplyOptions(embed, ephemeral);
	}

	/**
	 * Эмбед удалённого варна
	 * @param {ModalSubmitInteraction|ButtonInteraction} int
	 * @param {Warn} warn
	 * @param {boolean} [ephemeral=false]
	 * @return {Object<InteractionReplyOptions>}
	 */
	static async removeWarn(int, warn, ephemeral){
		if(!ephemeral) ephemeral = false;
		const target = await warn.getTarget();

		const embed = new MessageEmbed({
			title: `${reaction.emoji.success} | Варн номер ${warn.id} был снят с пользователя ${target.tag}`,
			color: reaction.color.success
		});

		return this.#getReplyOptions(embed, ephemeral);
	}

	/**
	 * Эмбед варна
	 * @param {CommandInteraction|ButtonInteraction|ModalSubmitInteraction} int
	 * @param {Warn} warn
	 * @return {Object<InteractionReplyOptions>}
	 */
	static async showWarn(int, warn){

		const target = await warn.getTarget();
		const author = await warn.getAuthor();

		const embed = new MessageEmbed({
			title: 'Варн' + (warn.flags.removed ? ' (Снят)': ''),
			color: (warn.flags.removed ? 0x808080 : reaction.color.warning)
		});

		embed.addField('Пользователь', target.tag);
		if(warn.reason)
			embed.addField('Причина', warn.reason);
		embed.addField('Тип', warn.type);

		embed.setAuthor({ name: author.tag, iconURL: author.avatarURL() });
		embed.setTimestamp(warn.date);
		embed.setThumbnail(target.avatarURL());
		embed.setFooter({ text: 'ID: ' + warn.id });

		return this.#getReplyOptions(embed, false, [
			{
				type: 2,
				style: 2,
				custom_id: 'warn|embedEditReason|' + warn.id,
				label: 'Изменить причину',
				disabled: warn.flags.removed
			},
			{
				type: 2,
				style: warn.flags.removed ? 3 : 4,
				custom_id: 'warn|' + (warn.flags.removed ? 'embedAddWarn|' : 'embedRemoveWarn|') + warn.id,
				label: warn.flags.removed ? 'Вернуть варн' : 'Снять варн'
			}
		]);
	}

	/**
	 * Эмбед постраничного списка варнов
	 * @param {CommandInteraction|ButtonInteraction} int
	 * @param {WarnPagination} pagination
	 * @return {Object<InteractionReplyOptions>}
	 */
	static async paginationWarns(int, pagination){
		const embed = new MessageEmbed({
			title: 'Список варнов',
			color: reaction.color.warning
		});

		let description = '';
		for(let warn of pagination.list){
			description += warn.toString() + '\n';
		}

		embed.setDescription(description);
		embed.setAuthor({ name: int.user.tag, iconURL: int.user.avatarURL() });
		embed.setTimestamp(int.createdTimestamp);
		embed.setThumbnail(pagination.target.avatarURL());

		embed.setFooter({ text: 'Страница: ' + pagination.pageNumber + '/' + pagination.pageLast + ' | Всего: ' + pagination.count + ' варнов'} );

		return this.#getReplyOptions(embed, false, [
			{
				type: 2,
				style: 1,
				custom_id: `warn|embedPage|${pagination.target.id}|${pagination.pageNumber - 1}`,
				label: 'Предыдущая',
				disabled: pagination.pageNumber === 1
			},
			{
				type: 2,
				style: 1,
				custom_id: `warn|embedPage|${pagination.target.id}|${pagination.pageNumber + 1}`,
				label: 'Следующая',
				disabled: pagination.pageNumber === pagination.pageLast
			},
		]);

	}

	/**
	 * Сборка экземпляра InteractionReplyOptions
	 * @param {MessageEmbed} embed
	 * @param {boolean} ephemeral
	 * @param {Object<ActionRow>} [buttons]
	 * @return {Object<InteractionReplyOptions>}
	 */
	static #getReplyOptions(embed, ephemeral, buttons){
		let result = {
			embeds: [embed],
			ephemeral: ephemeral
		};

		if(buttons){
			result.components = [{
				type: 1,
				components: buttons
			}];
		}

		return result;
	}

}

module.exports = EmbedBuilder;