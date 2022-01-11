const translit = require('transliteration');

module.exports = {

	active : true,
	name : 'namefix',
	title : 'Исправление никнейма',
	description : 'Используется для исправления никнейма пользователей. Команда доступна всем.',
	category : 'Никнейм',


	slashOptions : [{
		name : 'member',
		description : 'Пользователь у которого будет исправлен ник',
		type : 6,
		required : true
	}],


	init : function(){ return this; },


	/**
	 *
	 *
	 * @param {Message} msg
	 * @param {Array}   params Параметры команды
	 */
	slash : async function(int){
		const id = int.options.get('user');
		await this.fix(id, (text, status) => {
			int.reply({ content : (status ? reaction.emoji.success : reaction.emoji.error) + " " + text, ephemeral : !status });
		});
	},

	/**
	 * @param {Object} int interactions
	 */
	context : async function(int){
		await this.fix(int.targetId, (text, status) => {
			int.reply({ content : (status ? reaction.emoji.success : reaction.emoji.error) + " " + text, ephemeral : !status });
		});
	},

	/**
	 * @param {Number}   id           ID участника
	 * @param {Function} callbackSend Функция отправки сообщения
	 */
	fix : async (id) => {
		let member;
		try{
			member = await guild.members.fetch(id);
		}catch(e){
			return 'Участник не найден', false;
		}

		if(!commands.list.name) return 'Модуль "name" не активен', false;

		const result = await commands.list.name.silent(member);
		const name = member2name(member, 1);

		if(result.status) return 'Никнейм исправлен `' + result.name + '` => `' + result.fixed + '`', true;
		return 'Никнейм пользователя ' + name + ' корректен', false;
	}


};
