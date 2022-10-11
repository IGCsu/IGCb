/**
 * Переключение роли участнику.
 *
 * @param {Role} role Роль
 * @param {GuildMember|Number} member Объект или ID пользователя
 * @param {GuildMember} [author=member] Объект автора вызова функции
 * @return {Promise} Сообщение результата или ошибки
 */
global.toggleRole = (role, member, author) => {
	return new Promise(function (resolve, reject) {
		if (!(member instanceof Discord.GuildMember)) {
			member = guild.members.cache.get(member);
		}

		if (!member) return reject('Пользователь не найден');

		if (!author) author = member;

		const action = member.roles.cache.has(role.id)
			? { val: 'remove', text: 'убрана у' }
			: { val: 'add', text: 'выдана' };

		member.roles[action.val](role, 'По требованию ' + author.toName(true))
			.then(() => resolve(
				'Роль <@&' + role.id + '> ' + action.text + ' <@' + member.id + '>'
			))
			.catch(error => {
				console.error(error);
				reject('Неизвестная ошибка');
			});
	});
};
