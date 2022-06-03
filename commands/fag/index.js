const { title, description } = require('./about.json');

module.exports = {

	active: false,
	category: 'nsfw',

	name: 'fag',
	title: title,
	description: description,


	init: function () { return this; },

	/**
	 * Оправляет заданное сообщение с задержкой в 2 секунды
	 * @param {CommandInteraction} int
	 * @param {String}             string
	 */
	out: async function(int, string){
		await int.channel.sendTyping();
		await sleep(2000);
		await int.editReply({ content: string });
	},

	/**
	 * Пингует случайного пользователя
	 * @param {CommandInteraction} int
	 */
	call: async function(int){
		const channel = await guild.channels.fetch(int.channel.id, {
			cache: true, force: true
		});

		console.log(channel.members.size);

		// await int.reply({ content: 'Игогооооооо!' });
		// await this.out(int, 'Думаю...');
		// await this.out(int, 'А пониеб-то у нас:');
		// await int.followUp({
		// 	content: '<@' + int.channel.members.random() + '>!'
		// })
	},

	/**
	 * Функция обработки slash-команды.
	 * @param {CommandInteraction} int
	 */
	slash: async function(int){
		await this.call(int);
	}
}
