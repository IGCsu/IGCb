const regexGlobal = /<:[^:]+:([0-9]+)>/gi;
const regexLocal = /<:[^:]+:([0-9]+)>/i;

/**
 * Прикрепление реакций пользователя
 * @param {Message} msg Сообщение пользователя
 */
module.exports = async msg => {
	const emojis = msg.content.match(regexGlobal);
	if(!emojis) return;

	emojis.forEach(emoji => {
		emoji = emoji.match(regexLocal)[1];
		emoji = msg.guild.emojis.cache.get(emoji);
		if(emoji) msg.react(emoji);
	});

};
