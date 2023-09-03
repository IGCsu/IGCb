const fs = require('fs');
const dir = './commands/handler/functions/';

let data = {
	functions: {},
	allChannels: {},
	allowedChannelsFunctions: {}
};

/**
 * Возвращает функции-обработчики сообщений пользователя
 * @return {Object} functions Объект функций модуля
 * @return {Object} allChannels Объект названий функций, вызываемых при
 *   сообщении в любом канале
 * @return {Object} allowedChannelsFunctions Объект каналов и категориий,
 *   содержашие объекты функций
 */
module.exports = async () => {

	const files = fs.readdirSync(dir);
	for (const file of files) {

		const timeStart = process.hrtime();

		const name = file.split('.')[0];

		let func = require('./functions/' + file);
		if (func[name] && func[name].active) {
			func = func[name];
		}

		if (func.active) data.functions[name] = await func.init();

		if (func.active) {
			if (func.allChannels) {

				data.allChannels[name] = true;

			} else {

				for (let id in func.allowedChannels) {
					if (!data.allowedChannelsFunctions[id]) {
						data.allowedChannelsFunctions[id] = {};
					}
					data.allowedChannelsFunctions[id][name] = func.allowedChannels[id];
				}

			}
		}

		const timeEnd = process.hrtime(timeStart);
		const pref = (timeEnd[0] * 1000) + (timeEnd[1] / 1000000);

		log.initText += log.load(dir + file, pref, func.active);

	}

	return data;

};
