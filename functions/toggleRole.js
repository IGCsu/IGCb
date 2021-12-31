/**
 * Переключение роли участнику.
 *
 * 
 * @param {Role}    role    Роль
 * @param {Number}  user    ID пользователя
 * @param {Author}  author  Объект автора вызова функции
 */
 module.exports = (role, user, author) => {
	const member = guild.member(user);

	if(!member)
		return null, 'Пользователь с ID:' + user + ' не найден';

	let action = { val : 'add', text : 'выдана' };
	if(member._roles.includes(role.id))
		action = { val : 'remove', text : 'убрана у' };

	member.roles[action.val](role, 'По требованию ' + member2name(author, 1));
	const text = 'Роль <@&' + role.id + '> ' + action.text + ' <@' + member.id + '>';
	return text;
};