const channel = guild.channels.cache.get('574997373219110922');

let lastError = undefined;

/**
 * Обработка ошибки. Если одна и та же ошибка повторяется подряд - модуль отключается.
 *
 * @param {Error} e Объект ошибки
 * @param {String} name Название модуля
 * @param {Boolean} shutdown Если true - модуль не будет отключён. Необходимо для кастомных обработок ошибок вне модулей
 * @return {Boolean} Если true - значит ошибка повторилась подряд
 */
global.errorHandler = async (e, name, shutdown) => {

	let text = name ? 'Ошибка в `/' + name + '.js`!' : 'Фатальная ошибка!';
	let active = true;

	if(lastError === e.stack){
		if(shutdown) commands[name].active = false;
		active = false;
		text += ' Модуль отключён.';
	}

	const mention = process.env.DEVELOPER
		? '<@' + process.env.DEVELOPER + '> '
		: '<@&920407448697860106> ';

	await channel.send({ content: mention + text + '```' + e.stack + '```' });

	lastError = e.stack;

	return active;

};
