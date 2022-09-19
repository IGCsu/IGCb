const SlashOptions = require('../../BaseClasses/SlashOptions');
const BaseCommand = require('../../BaseClasses/BaseCommand');
const LangSingle = require('../../BaseClasses/LangSingle');

const slashOptions = require('./slashOptions');
const { title, description } = require('./about.json');

class Orator extends BaseCommand {

	constructor(path){
		super(path)

		this.category = 'Роли'
		this.name = 'orator';
		this.title = title;
		this.description = description;
		this.slashOptions = slashOptions;

		this.role = guild.roles.cache.get('809040260582998016');

		if(!this.role){
			this.active = false;
			log.initText += log.error(path + ': Роль "Младший Оратор" не найдена');
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
		return member.permissions.has('MANAGE_ROLES') ||
			member.roles.cache.has('620194786678407181') ||
			member.id === '500020124515041283'}

}

module.exports = Orator;
