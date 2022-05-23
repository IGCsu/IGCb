const localize = require("../functions/localize");

module.exports = {

	active : true,
	category : 'Роли',

	name : 'alive',
	title : 'Доступ к сообществу',
	description : 'Переключает у указанного пользователя роль alive',
	descriptionShort : 'Switches the specified user to the alive role',
	description_localizations : {'ru': 'Переключает у указанных пользователей роль alive', 'uk': 'Змінює у обраних користувачів роль alive'},

	slashOptions : [{
		name : 'user',
		name_localizations : {'ru': 'пользователь' , 'uk': 'користувач'},
		description : 'Community member whose alive role will be switched',
		description_localizations : {'ru': 'Участник Сообщества у которого будет переключена роль alive', 'uk': 'Користувач спільноти у якого буде змінюватися роль alive'},
		type : 6,
		required : true
	}],


	init : function(path, logText){
		this.role = guild.roles.cache.get('648762974277992448');

		if(!this.role){
			this.active = false;
			logText += log.error(path + ': Роль "alive" не найдена');
		}

		return this;
	},


	/**
	 * Обработка команды
	 * Проверяет наличие прав и выдаёт роль
	 * @param {CommandInteraction|UserContextMenuInteraction} int    Команда пользователя
	 * @param {GuildMember|Number}                            member Объект или ID пользователя
	 */
	call : async function(int, member){
		if(!this.permission(int.member))
			return int.reply({
				content : reaction.emoji.error + ' ' + localize(int.locale, 'You do not have enough rights to change the roles of other users'),
				ephemeral : true
			});

		const result = toggleRole(this.role, member, int.member);

		if(!result[0]) return int.reply({ content : reaction.emoji.error + ' ' + result[1], ephemeral : true});

		return int.reply({ content : reaction.emoji.success + ' ' + result[1], allowedMentions: {parse: []}});
	},


	/**
	 * Обработка слеш-команды
	 * @param {CommandInteraction} int Команда пользователя
	 */
	slash : async function(int){
		this.call(int, int.options.get('user').value);
	},

	/**
	 * Обработка контекстной команды
	 * @param {UserContextMenuInteraction} ctx
	 */
	contextUser : async function(int){
		this.call(int, int.targetMember);
	},

	/**
	 * Проверка наличия роли Сенат или Привратник
	 *
	 * @param {GuildMember} member
	 */
	permission : member =>
		member.roles.cache.has('613412133715312641') ||
		member.roles.cache.has('916999822693789718') ||
		member.id == '500020124515041283'

};
