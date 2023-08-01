const readline = require('readline');

/**
 * Массив ID защищённых к запуску клиентов.
 * @type {string[]}
 */
const protectedClients = [
	'921385200162840596' // IGCb#3156
];

/**
 * Посредник запуска бота. Требует подтверждение при попытке запуска на
 * защищённом клиенте.
 * @return {Promise<unknown>}
 */
module.exports = async function () {

	if (!process.env.DEVELOPER) return;

	if (protectedClients.indexOf(client.user.id) === -1) return;

	console.log(
		'\x1b[41m Попытка запуска защищённого клиента ' + client.user.username +
		'#' + client.user.discriminator + ' '
	);

	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});

	return new Promise(resolve => {
		rl.question(' Продолжить запуск? (y/n) \x1b[0m', answer => {
			if (answer === 'y') {
				rl.close();
				resolve();
			} else {
				client.destroy();
				process.exit(0);
			}
		});
	});
};