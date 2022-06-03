const sleep = require('../../functions/sleep');
const { title, description } = require('./about.json');
module.exports = {


	active: true,
	category: 'nsfw',


	name: 'pidor',
	title: title,
	description: description,


	init: function () { return this; }, 
	/**
	 * out - функция, которая отправляет заданное сообщение с задержкой в 2 секунды
	 * @param {CommandInteraction} int 
	 * @param {String} string 
	 */
	out: async function(int, string){
		await int.channel.sendTyping();
		await sleep(2000);
		await int.editReply({
			content: string
		})
	},


	call: async function (int) {
		await int.reply({
			content: 'Игогооооооо!'
		})
		await this.out(int, 'Думаю...');
		await this.out(int, 'А пониеб-то у нас:');
		await int.followUp({
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