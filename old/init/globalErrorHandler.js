/**
 * Инициализация отлова ошибок
 */
module.exports = async () => {
	console.time('Events unhandledRejection & uncaughtException');
	process
		.on('unhandledRejection', error => {
			console.error(error);
			error.handler().then(() => {
				process.exit(1);
			});
		})
		.on('uncaughtException', error => {
			console.error(error);
			error.handler().then(() => {
				process.exit(1);
			});
		});
	console.timeEnd('Events unhandledRejection & uncaughtException');
};

