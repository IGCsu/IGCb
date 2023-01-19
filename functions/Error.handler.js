const channel = guild.channels.cache.get('574997373219110922');

let lastError = undefined;

/**
 * Обработка ошибки. Если одна и та же ошибка повторяется подряд - модуль
 * отключается.
 *
 * @param {string}  [module] Название модуля
 * @param {boolean} [shutdown] Если true - модуль не будет отключён. Необходимо
 *   для кастомных обработок ошибок вне модулей
 * @param {Object}  [int]
 * @return {boolean} Если true - значит ошибка повторилась подряд
 */
Error.prototype.handler = async function (module, shutdown, int) {
	let text = module ? 'Ошибка в `/' + module + '/`!' : 'Фатальная ошибка!';
	let active = true;

	if (lastError === this.stack) {
		if (shutdown) commands[module].active = false;
		active = false;
		text += ' Модуль отключён.';
	}

	const mention = process.env.DEVELOPER
		? '<@' + process.env.DEVELOPER + '> '
		: '<@&920407448697860106> ';

	await channel.send({ content: mention + text + '```' + this.stack + '```' });

	if (int) {
		int.error(this.stack);
	} else if (log) {
		log.error(this.stack);
	} else {
		console.error(this.stack);
	}

	lastError = this.stack;

	return active;
};
