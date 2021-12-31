module.exports = {

	active : true,
	name : 'alive',
	title : 'Доступ к сообществу',
	description : 'Переключает у указанных пользователей роль alive',
	category : 'Роли',


	init : function(){
		return this;
	},


	/**
	 * Роль "Alive"
	 *
	 * @type {Role}
	 */
	role : guild.roles.cache.get('648762974277992448'),


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
        member._roles.includes('613412133715312641') ||
        member._roles.includes('916999822693789718')

};