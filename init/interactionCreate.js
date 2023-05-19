/**
 * Инициализирует прослушку взаимодействия с ботом
 */
module.exports = async () => {
	console.time('Event interactionCreate');
	client.on('interactionCreate', async int => {
		const name = int.commandName ?? int.customId.split('|')[0];

		if (!commands[name] || !commands[name].active) return;

		if (!int.indexFunc || !commands[name][int.indexFunc]) return;

		initLog(int, name);

		try {
			await commands[name][int.indexFunc](int);
		} catch (e) {
			e.handler(name, true, int);
		}
	});
	console.timeEnd('Event interactionCreate');
};