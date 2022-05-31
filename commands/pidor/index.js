const { title, description } = require('./about.json');
module.exports = {


	active: true,
	category: 'nsfw',


	name: 'poniyob',
	title: title,
	description: description,


	init: function () { return this; },


	call: function (int) {
		int.reply({
			content: 'Игогооооооо!'
		})
		int.editReply({
			content: 'Думаю...'
		})
		int.editReply({
			content: 'А пониеб-то у нас:'
		})
		int.followUp({
			content: int.guild.members.cache.random().tag + '!'
		})
	},

	/**
	 * Функция обработки slash-команды.
	 * Если функция существует - то при инициализации будет добавлена слеш-команда с данными модуля и slashOptions, если тот имеется.
	 * @param {CommandInteraction} int
	 */
	slash: async function (int) { 
		await this.call(int);
	}
}