const translit = require('transliteration');

module.exports = {

	active : true,
	name : 'namefix',
	title : 'Исправление никнейма',
	description : 'Используется для исправления никнейма пользователей. Команда доступна всем.',
	descriptionShort : 'Used to fix the nickname of users. The command is available to everyone.',
	description_localizations : {'ru': 'Используется для исправления никнейма пользователей. Команда доступна всем.', 'uk': 'Використовується для виправлення імені користувача'},
	category : 'Никнейм',


	slashOptions : [{
		name : 'member',
		description : 'The user whose nickname will be corrected',
		description_localizations : {'ru': 'Пользователь у которого будет исправлен ник', 'uk': 'Користувач чиє ім\'я буде виправленно'},
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
			: { ephemeral : true, content : `Никнейм пользователя ${member.user} корректен`, allowedMentions : { parse: [] }};
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
	context : async function(ctx){
		const options = await this.call(ctx.targetMember);
		await ctx.reply(options);
	},


};
