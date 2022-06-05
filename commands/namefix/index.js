const slashOptions = require('./slashOptions.json');
const { title, description } = require('./about.json');

module.exports = {

	active : true,
	category : 'Модерация',

	name : 'namefix',
	title : title,
	description : description,
	slashOptions : slashOptions,

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
