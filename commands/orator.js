module.exports = {

	active : true,
	category : 'Роли',

	name : 'orator',
	title : 'Доступ к ивенты',
	description : 'Переключает у указанных пользователей роль orator',
	descriptionShort : 'Switches the specified users to the orator role',
	description_localizations : {'ru': 'Переключает у указанных пользователей роль orator', 'uk': ''},

	slashOptions : [{
		name : 'user',
		name_localizations : {'ru': 'пользователь', 'uk': ''},
		description : 'Community member whose orator role will be switched',
		description_localizations : {'ru': 'Участник Сообщества у которого будет переключена роль orator', 'uk': ''},
		type : 6,
		required : true
	}],

	init : function(path, logText){
		this.role = guild.roles.cache.get('809040260582998016');

		if(!this.role){
			this.active = false;
			logText += log.error(path + ': Роль "Младший оратор" не найдена');
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
				content : reaction.emoji.error + ' У вас недостаточно прав для изменения ролей других пользователей',
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
	 * Проверка наличия роли Оратор или права управления ролями
	 *
	 * @param {GuildMember} member
	 */
	permission : member =>
		member.permissions.has('MANAGE_ROLES') ||
		member.roles.cache.has('620194786678407181') ||
		member.id == '500020124515041283'

};
