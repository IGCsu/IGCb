const SlashOptions = require('../../BaseClasses/SlashOptions');
const BaseCommand = require('../../BaseClasses/BaseCommand');
const LangSingle = require('../../BaseClasses/LangSingle');

const { title, description } = require('./about.json');

class Fag extends BaseCommand{

	constructor(path) {
		super(path);

		this.category = 'nsfw'
		this.name = 'fag'
		this.title = new LangSingle(title);
		this.description = new LangSingle(description);

		return new Promise(async resolve => {
			resolve(this);
		});
	}

	/**
	 * Оправляет заданное сообщение с задержкой в 2 секунды
	 * @param {CommandInteraction} int
	 * @param {String}             string
	 */
	async out(int, string){
		await int.channel.sendTyping();
		await sleep(2000);
		await int.editReply({ content: string });
	}

	/**
	 * Пингует случайного пользователя
	 * @param {CommandInteraction} int
	 */
	async call(int){

		await int.reply({ content: 'Игогооооооо!' });

		const list = await int.guild.members.fetch({cache: false})
		list.filter(memb => {return memb.roles.highest.id === '575721274693910528' && memb.presence.status !== 'offline'})

		await this.out(int, 'Думаю...');
		await this.out(int, 'А пониеб-то у нас:');
		await int.followUp({
		 	content: '<@' + list.random() + '>!'
		})
	}

	/**
	 * Функция обработки slash-команды.
	 * @param {CommandInteraction} int
	 */
	async slash(int){
		await this.call(int);
	}
}

module.exports = Fag;
