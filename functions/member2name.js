/**
 * Формирует имя участника гильдии
 *
 * @param {GuildMember} m Объект участника гильдии
 * @param {Boolean} [dis=false] Если true - добавляет к нику дискриминатор
 * @param {Boolean} [id=false] Если true - добавляет к результату ID
 * @return {String} Имя участника
 */
global.member2name = (m, dis, id) => {
	let text = m.displayName ?? m.nickname ?? m.user.username;

	if(dis) text += '#' + m.user.discriminator;

	if(id){
		if(m.user.bot) text = 'bot:' + text;
		text = m.user.id + ':' + text;
	}

	return text;
}
