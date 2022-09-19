const SlashOptions = require('../../BaseClasses/SlashOptions');
const BaseCommand = require('../../BaseClasses/BaseCommand');
const LangSingle = require('../../BaseClasses/LangSingle');
const { CommandInteraction, GuildMember, UserContextMenuInteraction } = require('discord.js')

const slashOptions = require('./slashOptions');
const { title, description } = require('./about.json');

class Alive extends BaseCommand {

	constructor(path){
		super(path)

		this.category = 'Роли'
		this.name = 'alive';
		this.title = title;
		this.description = description;
		this.slashOptions = slashOptions;

		this.role = guild.roles.cache.get('648762974277992448');

		if(!this.role){
			this.active = false;
			log.initText += log.error(path + ': Роль "alive" не найдена');
		}

		return new Promise(async resolve => {
			resolve(this);
		});
	}


	/**
	 * Обработка команды
	 * Проверяет наличие прав и выдаёт роль
	 * @param {CommandInteraction|UserContextMenuInteraction} int    Команда пользователя
	 * @param {GuildMember|Number}                            member Объект или ID пользователя
	 */
	async call(int, member){
		if(!this.permission(int.member))
			return int.reply({
				content : reaction.emoji.error + ' ' + int.str('You do not have enough rights to change the roles of other users'),
				ephemeral : true
			});

		toggleRole(this.role, member, int.member).then(result => {
			int.reply({ content : reaction.emoji.success + ' ' + result, allowedMentions: constants.AM_NONE});
		}).catch(result => {
			int.reply({ content : reaction.emoji.error + ' ' + result, ephemeral : true});
		});
	}


	/**
	 * Обработка слеш-команды
	 * @param {CommandInteraction} int Команда пользователя
	 */
	async slash(int){
		this.call(int, int.options.get('user').value);
	}

	/**
	 * Обработка контекстной команды
	 * @param {UserContextMenuInteraction} int
	 */
	async contextUser(int){
		this.call(int, int.targetMember);
	}

	/**
	 * Проверка наличия роли Сенат или Привратник
	 *
	 * @param {GuildMember} member
	 */
	permission(member){
		return member.roles.cache.has('613412133715312641') ||
		member.roles.cache.has('916999822693789718') ||
		member.id === '500020124515041283'}

}

module.exports = Alive;
