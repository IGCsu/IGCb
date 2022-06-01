/**
 * Прикрепление реакций
 * @param {Message} msg Сообщение пользователя
 */
module.exports = async msg => {
	if(!msg.content.startsWith('<@') || !msg.content.endsWith('>')) return;

	await msg.react(reaction.emoji.Sg3);
	await msg.react(reaction.emoji.Sg0);
};
