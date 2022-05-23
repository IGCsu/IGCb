const translit = require('transliteration');

module.exports = {

	active : true,
	name : 'namefix',
	title : {
		'ru':'Коррекция никнейма',
		'en':'Nickname correction',
		'uk':'Корекція нікнейму',
	},
	description : {
		'ru':'Используется для исправления никнейма пользователей. Команда доступна всем',
		'en':'Used to correct the nickname of users. The team is available to everyone',
		'uk':'Використовується для виправлення нікнейму користувачів. Команда доступна всім',
	},

	slashOptions : {

		member : {
			type : 6,
			required : true,
			description : {
				'ru':'Пользователь у которого будет исправлен ник',
				'en':'The user whose nickname will be corrected',
				'uk':'Користувач чиє ім\'я буде виправленно',
			}
		}

	},


	init : function(){ return this; },

	/**
	 * @param {GuildMember} member Объект пользователя
	 */
	call : async member => {
		if(!commands.name) return 'Модуль "name" не активен', false;

		const result = await commands.name.silent(member);

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
