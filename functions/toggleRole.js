/**
 * Переключение роли участнику.
 *
 * @param {Role} role Роль
 * @param {GuildMember|Number} member Объект или ID пользователя
 * @param {GuildMember} author Объект автора вызова функции
 * @return {[Boolean, String]} Статус и сообщение результата
 */
global.toggleRole = async (role, member, author) => {

	if(!(member instanceof Discord.GuildMember)){
		member = guild.members.cache.get(member);
	}

	if(!member) return [false, 'Пользователь не найден'];

	try{
		const action = member.roles.cache.has(role.id)
			? { val: 'remove', text: 'убрана у' }
			: { val: 'add', text: 'выдана' };

		await member.roles[action.val](role, 'По требованию ' + member2name(author, true));

		return [true, 'Роль <@&' + role.id + '> ' + action.text + ' <@' + member.id + '>'];
	}catch(e){
		console.error(e.stack);
		return [false, 'Неизвестная ошибка'];
	}
};
