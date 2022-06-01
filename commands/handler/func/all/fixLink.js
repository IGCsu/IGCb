const regex = /https?:\/\/media\.discordapp\.net\/\S+((\.webm)|(\.mp4))/i;

/**
 * Исправление нерабочей ссылки
 * @param {Message} msg Сообщение пользователя
 */
module.exports = async msg => {
	if(!regex.test(msg.content)) return;

	await msg.delete();
	await msg.channel.send({
		content: msg.author.toString() + ': ' + msg.content.replace('media.discordapp.net', 'cdn.discordapp.com'),
		reply: {
			messageReference: msg.reference?.messageId,
			failIfNotExists: false
		}
	});
};
