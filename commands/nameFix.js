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
	 * @param {GuildMember} member Объект пользователя
	 */
	call : async member => {
		if(!commands.list.name) return 'Модуль "name" не активен', false;

		const result = await commands.list.name.silent(member);

		return result.status
			? { ephemeral : false, content : 'Никнейм исправлен `' + result.name + '` => `' + result.fixed + '`' }
			: { ephemeral : true, content : `Никнейм пользователя ${member.user} корректен` }
	},


	/**
	 * Обработка слеш-команды
	 * @param {CommandInteraction} int Команда пользователя
	 */
	slash : async function(int){
		const options = await this.call(int.options.getMember('member'));
		await int.reply(options);
	},

	/**
	 * Обработка контекстной команды
	 * @param {UserContextMenuInteraction} ctx
	 */
	context : async function(int){
		const options = await this.call(member);
		await int.reply(options);
	},


};
