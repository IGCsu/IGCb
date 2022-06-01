const regex = /https?:\/\/media\.discordapp\.net\/\S+((\.webm)|(\.mp4))/i;

/**
 * Прикрепление реакций
 * @param {Message} msg Сообщение пользователя
 */
module.exports = async msg => {
	if(msg.author.bot || (msg.flags & 64)) return;

	await msg.react(reaction.emoji.Sg3);
	await msg.react(reaction.emoji.Sg0);
};
