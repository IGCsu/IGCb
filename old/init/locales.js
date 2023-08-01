const fs = require('fs');

/**
 * Определяет локализации бота
 */
module.exports = async () => {
	console.log('Loading locales:');
	global.locales = {};
	fs.readdirSync('./locales/').forEach(file => {
		const path = './locales/' + file;
		console.time(path);
		locales[file.split('.')[0]] = require('.' + path);
		console.timeEnd(path);
	});
};