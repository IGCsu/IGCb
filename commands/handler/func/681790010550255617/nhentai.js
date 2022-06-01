const regex = /^[0-9]{2,}$/;

/**
 * Преобразование кода в ссылку
 * @param {Message} msg Сообщение пользователя
 */
module.exports = async msg => {
	if(!regex.test(msg.content)) return;

	await msg.channel.send({
		content: msg.author.toString() + ': https://nhentai.net/g/' + msg.content + '/',
		allowedMentions: {
			parse: []
		},
		reply: {
			messageReference: msg.reference?.messageId,
			failIfNotExists: false
		}
	});
};
