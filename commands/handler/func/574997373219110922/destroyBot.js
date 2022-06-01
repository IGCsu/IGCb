/**
 * Прекращает работу бота при обнаружения запуска в другом месте
 *
 * @param {Message} msg Сообщение пользователя
 */
module.exports = async msg => {
	if(msg.author.id != client.user.id) return;
	if(msg.embeds[0]?.title != 'Бот запущен') return;
	if(msg.embeds[0]?.footer?.text == hash) return;

	await msg.reply({ content : 'Прекращена работа бота-дубликата у ' + (process.env.USERNAME ?? 'Host') });

	log.error('Прекращение работы бота: бот запущен в другом месте');

	return process.kill(process.pid);
};
