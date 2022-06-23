const slashOptions = require('./slashOptions.json');
const { title, description } = require('./about.json');

module.exports = {

	active : true,
	category : 'Развлечения',

	name : 'roll',
	title : title,
	description : description,
	slashOptions : slashOptions,

	init : async function(){
		return this;
	},

	/**
	 * Возвращает случайное значение из указанного диапозона
	 * @param  {Number} min Минимальное значение (По умолчанию 1)
	 * @param  {Number} max Максимальное значение (По умолчанию 100)
	 * @return {Number}
	 */
	call : function(min, max){

		if(!min) min = 1;
		if(!max) max = 100;

		return Math.floor( Math.random() * (max - min + 1) ) + min;
	},


	/**
	 * Обработка слеш-команды
	 * @param {CommandInteraction} int Команда пользователя
	 */
	slash : async function(int){
		let min = int.options.getInteger('min');
		let max = int.options.getInteger('max');

		const expr = (!min && !max && int.channel.nsfw === true)

		const value = expr ? 'https://nhentai.net/g/' + this.call(1, 303999) + '/' : this.call(min, max);

		await int.reply({ content : value.toString() });
	}
};
