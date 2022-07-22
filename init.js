const initConstants = require('./init/constants.js');
const initCommands = require('./init/commands.js');
const initLocales = require('./init/locales.js');
const initFunctions = require('./init/functions.js');
const initInteractionCreate = require('./init/interactionCreate.js');
const initGuild = require('./init/guild.js');
const initGlobalErrorHandler = require('./init/globalErrorHandler.js');
const initSessionId = require('./init/sessionId.js');
const initSetActivity = require('./init/setActivity.js');
const initStartMessage = require('./init/startMessage.js');

/**
 * Массив модулей разрешённых к подключению.
 * Если пустой - подключаются в естественном порядке. В ином случае, подключаются лишь указанные модули.
 *
 * Пример: "help"
 * @type {Array}
 */
global.debugAllowModules = ['warn'];

module.exports = async () => {

	console.timeEnd('Client login');

	console.log('Start init.js');

	initConstants();

	await initGuild();
	await initLocales();
	await initFunctions();
	await initGlobalErrorHandler();
	await initSessionId();
	await initCommands();
	await initSetActivity();
	await initInteractionCreate();
	await initStartMessage();

	console.timeEnd('Client initialized in');
	log.start('== Bot ready ==');

};
