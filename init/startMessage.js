/**
 * Определяет константы бота
 */
module.exports = async () => {
	if (!debugAllowModules.length) {
		console.time('Send start bot');
		const author = process.env.DEVELOPER
			? '<@' + process.env.DEVELOPER + '>'
			: process.env.USERNAME ?? 'Host';
		log.initText = log.initText.replace(/.\/commands\//gi, './');
		let embed = new Discord.MessageEmbed()
			.setTitle('Бот запущен')
			.setTimestamp()
			.setFooter({ text: sessionId })
			.setDescription(
				'hosted by ' + author + '\n\n```ansi' + log.initText + '```'
			);
		await guild.channels.cache.get('574997373219110922')
			.send({ embeds: [embed] });
		console.timeEnd('Send start bot');
	}
};
