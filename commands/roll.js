const fetch = require('node-fetch');

module.exports = {

	active : true,
	category : 'Голосовые каналы',

	name : 'roll',
	title : {
		'ru':'Случайное число',
		'en-US':'Random number',
		'uk':'Випадкове число',
	},
	description : {
		'ru':'Выдаёт случайное число (По умолчанию 1-100)',
		'en-US':'Gives a random number (Default 1-100)',
		'uk':'Видає довільне число (За замовчуванням 1-100)',
	},

	slashOptions : [
		{
			name : 'min',
			description : 'Минимальное значение (По умолчанию 1)',
			type : 4,
			required : false
		},
		{
			name : 'max',
			description : 'Максимальное значение (По умолчанию 100)',
			type : 4,
			required : false
		}
	],

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
