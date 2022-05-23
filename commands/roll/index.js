const fetch = require('node-fetch');

module.exports = {

	active : true,
	category : 'Голосовые каналы',

	name : 'roll',
	title : {
		'ru':'Случайное число',
		'en':'Random number',
		'uk':'Випадкове число',
	},
	description : {
		'ru':'Выдаёт случайное число (По умолчанию 1-100)',
		'en':'Gives a random number (Default 1-100)',
		'uk':'Видає довільне число (За замовчуванням 1-100)',
	},

	slashOptions : {

		min : {
			type : 4,
			required : false,
			description : {
				'ru':'Минимальное значение (По умолчанию 1)',
				'en':'Minimum value (Default 1)',
				'uk':'Мінімальне значення (За замовчуванням 1)',
			}
		},

		max : {
			type : 4,
			required : false,
			description : {
				'ru':'Максимальное значение (По умолчанию 100)',
				'en':'Maximum value (Default 100)',
				'uk':'Максимальне значення (За замовчуванням 100)',
			}
		},

	},

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
