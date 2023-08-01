const { GuildMember } = require('discord.js');

/**
 * Формирует имя участника гильдии
 *
 * @param {boolean} [discriminator=false] Если true - добавляет к нику
 *   дискриминатор
 * @param {boolean} [id=false] Если true - добавляет к результату ID
 * @return {string} Имя участника
 */
GuildMember.prototype.toName = function (discriminator, id) {
	let str = this.displayName ?? this.nickname ?? this.user.username;

	if (discriminator) {
		str += '#' + this.user.discriminator;
	}

	if (id) {
		if (this.user.bot) {
			str = 'bot:' + str;
		}
		str = this.user.id + ':' + str;
	}

	return str;
};