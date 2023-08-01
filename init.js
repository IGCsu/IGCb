/**
 * Массив файлов инициализации в порядке подключения.
 *
 * @type {function[]}
 */
const init = [
	require('./old/init/protection.js'),
	require('./old/init/constants.js'),
	require('./old/init/guild.js'),
	require('./old/init/locales.js'),
	require('./old/init/functions.js'),
	require('./old/init/globalErrorHandler.js'),
	require('./old/init/sessionId.js'),
	require('./old/init/commands.js'),
	require('./old/init/setActivity.js'),
	require('./old/init/interactionCreate.js'),
	require('./old/init/startMessage.js')
];

/**
 * Массив модулей разрешённых к подключению.
 * Если пустой - подключаются в естественном порядке. В ином случае,
 * подключаются лишь указанные модули.
 *
 * Пример: "help"
 * @type {string[]}
 */
global.debugAllowModules = [];

module.exports = async () => {

	console.timeEnd('Client login');

	console.log('Start init.js');

	for (const module of init) {
		await module();
	}

	console.timeEnd('Client initialized in');
	log.start('== Bot ready ==');

};
