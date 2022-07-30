const { title, description } = require('./about.json');

module.exports = {

	active: true,
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

		await int.reply({ content: 'Игогооооооо!' });

		const list = await int.guild.members.fetch({cache: false})
		list.filter(memb => {return memb.roles.highest.id === '575721274693910528' && memb.presence.status !== 'offline'})

		await this.out(int, 'Думаю...');
		await this.out(int, 'А пониеб-то у нас:');
		await int.followUp({
		 	content: '<@' + list.random() + '>!'
		})
	},

	/**
	 * Функция обработки slash-команды.
	 * @param {CommandInteraction} int
	 */
	slash: async function(int){
		await this.call(int);
	}
}
