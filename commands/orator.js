module.exports = {

	active : true,
	name : 'orator',
	title : 'Доступ к ивенты',
	description : 'Переключает у указанных пользователей роль Младший оратор',
	category : 'Роли',


	init : function(){
		return this;
	},


	/**
	 * Роль "Alive"
	 *
	 * @type {Role}
	 */
	role : guild.roles.cache.get('809040260582998016'),


	/**
	 * @param {Object} int interactions
	 */
	slash : async function(int){
		if(!this.permission(int.member))
			return int.reply({
				content : reaction.emoji.error + ' У вас недостаточно прав для изменения ролей других пользователей',
				ephemeral : true
			});

		const text, notFound = toggleRole(this.role, int.options.get('user'), int.member);
		
        if(!text) return int.reply({ content : reaction.emoji.error + ' ' + notFound, ephemeral : true});
        
        return int.reply({ content : reaction.emoji.success + ' ' + text });
	},

	/**
	 * @param {Object} int interactions
	 */
	context : async function(int){
		if(!this.permission(int.member))
			return int.reply({
				content : reaction.emoji.error + ' У вас недостаточно прав для изменения ролей других пользователей',
				ephemeral : true
			});

		const text, notFound = toggleRole(this.role, int.targetId, int.member);
		
        if(!text) return int.reply({ content : reaction.emoji.error + ' ' + notFound, ephemeral : true});
        
        return int.reply({ content : reaction.emoji.success + ' ' + text });
    },

	/**
	 * Проверка наличия роли Сенат
	 *
	 * @param {Array} roles
	 */
    permission : member =>
        member.permissions.has('MANAGE_ROLES') ||
        member._roles.includes('620194786678407181') ||
        member._roles.includes('916999822693789718')

};