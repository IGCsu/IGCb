/**
 * Массив файлов инициализации в порядке подключения.
 *
 * @type {function[]}
 */
const init = [
	require('./init/protection.js'),
	require('./init/constants.js'),
	require('./init/guild.js'),
	require('./init/locales.js'),
	require('./init/functions.js'),
	require('./init/globalErrorHandler.js'),
	require('./init/sessionId.js'),
	require('./init/commands.js'),
	require('./init/setActivity.js'),
	require('./init/interactionCreate.js'),
	require('./init/startMessage.js')
];

/**
 * Массив модулей разрешённых к подключению.
 * Если пустой - подключаются в естественном порядке. В ином случае,
 * подключаются лишь указанные модули.
 *
 * Пример: "help"
 * @type {string[]}
 */
global.debugAllowModules = ['levels'];

module.exports = async () => {

	console.timeEnd('Client login');

	console.log('Start init.js');

	for (const module of init) {
		await module();
	}

	console.timeEnd('Client initialized in');
	log.start('== Bot ready ==');

};
