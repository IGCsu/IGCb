const channel = guild.channels.cache.get('574997373219110922');

let lastError = undefined;


/**
 * Обработка ошибки. Если одна и та же ошибка повторяется подряд - модуль отключается.
 *
 * @param {Error}       e    Объект ошибки
 * @param {String}      name Название модуля
 * @param {Interaction} int  Interaction
 */
module.exports = (e, name, int) => {

	let text = 'Ошибка в `' + name + '`!';

	if(lastError == e.stack && name != 'nocommand'){
		commands[name].active = false;
		text += ' Модуль отключён.';
	}

	channel.send({ content: '<@&920407448697860106> ' + text + '```' + e.stack + '```' });

	lastError = e.stack;

};
