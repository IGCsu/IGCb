const SlashOptions = require('../../BaseClasses/SlashOptions.js');
const BaseCommand = require('../../BaseClasses/BaseCommand.js');
const LangSingle = require('../../BaseClasses/LangSingle.js');
const {
	CommandInteraction,
	GuildMember,
	UserContextMenuInteraction,
	InteractionReplyOptions
} = require('discord.js');

const slashOptions = require('./slashOptions.js');
const { title, description } = require('./about.json');

class NameFix extends BaseCommand {

	constructor (path) {
		super(path);

		this.category = 'Модерация';
		this.name = 'namefix';
		this.title = new LangSingle(title);
		this.description = new LangSingle(description);
		this.slashOptions = slashOptions;
	}

	/**
	 * @param {GuildMember} member Объект пользователя
	 * @return {Promise<{ephemeral: boolean, content: string}|{ephemeral:
	 *   boolean, content: string, allowedMentions: {parse: []}}>}
	 */
	async call (member) {
		if (!commands.name) return 'Модуль "name" не активен', false;

		const result = await commands.name.silent(member);

		return result.status
			? {
				ephemeral: false,
				content: 'Никнейм исправлен `' + result.name + '` => `' + result.fixed +
					'`'
			}
			: {
				ephemeral: true,
				content: `Никнейм пользователя ${member.user} корректен`,
				allowedMentions: constants.AM_NONE
			};
	}


	/**
	 * Обработка слеш-команды
	 * @param {CommandInteraction} int Команда пользователя
	 */
	async slash (int) {
		const options = await this.call(int.options.getMember('member'));
		await int.reply(options);
	}

	/**
	 * Обработка контекстной команды
	 * @param {UserContextMenuInteraction} ctx
	 */
	async context (ctx) {
		const options = await this.call(ctx.targetMember);
		await ctx.reply(options);
	}

}

module.exports = NameFix;
