const fetch = require('node-fetch');
const slashOptions = require('./slashOptions.json');
const { title, description } = require('./about.json');

module.exports = {

	active : true,
	category : 'Голосовые каналы',

	name : 'roll',
	title : title,
	description : description,
	slashOptions : slashOptions,

	init : async function(path){
		return this;
	},

	/**
	 * Возвращает случайное значение из указанного диапозона
	 * @param  {Number} min Минимальное значение (По умолчанию 1)
	 * @param  {Number} max Максимальное значение (По умолчанию 100)
	 * @return {Number}
	 */
	call : async function(min, max){

		if(!min) min = 1;
		if(!max) max = 100;

		return Math.floor( Math.random() * (max - min + 1) ) + min;
	},


	/**
	 * Обработка слеш-команды
	 * @param {CommandInteraction} int Команда пользователя
	 */
	slash : async function(int){
		const value = await this.call(int.options.getInteger('min'), int.options.getInteger('max'));

		await int.reply({ content : value.toString() });
	}

};
