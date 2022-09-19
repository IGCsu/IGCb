const SlashOptions = require('../../BaseClasses/SlashOptions');
const BaseCommand = require('../../BaseClasses/BaseCommand');
const LangSingle = require('../../BaseClasses/LangSingle');
const { CommandInteraction } = require('discord.js')

const slashOptions = require('./slashOptions');
const { title, description } = require('./about.json');

class Roll extends BaseCommand{

	constructor(path) {
		super(path);


		this.category = 'Развлечения'
		this.name = 'roll'
		this.title = title
		this.description = description
		this.slashOptions = slashOptions


		return new Promise(async resolve => {
			resolve(this);
		});
	}

	/**
	 * Возвращает случайное значение из указанного диапозона
	 * @param  {Number} min Минимальное значение (По умолчанию 1)
	 * @param  {Number} max Максимальное значение (По умолчанию 100)
	 * @return {Number}
	 */
	call(min, max){

		if(!min) min = 1;
		if(!max) max = 100;

		return Math.floor( Math.random() * (max - min + 1) ) + min;
	}


	/**
	 * Обработка слеш-команды
	 * @param {CommandInteraction} int Команда пользователя
	 */
	async slash(int){
		let min = int.options.getInteger('min');
		let max = int.options.getInteger('max');

		const expr = (!min && !max && (int.channel.nsfw === true || int.channel?.parent?.nsfw === true));

		const value = expr ? 'https://nhentai.net/g/' + this.call(1, 303999) + '/' : this.call(min, max);

		await int.reply({ content : value.toString() });
	}
}

module.exports = Roll;
