/**
 * Инициализация отлова ошибок
 */
module.exports = async () => {
    console.time('Events unhandledRejection & uncaughtException');
    process
        .on('unhandledRejection', (reason, p) => {
            console.error(reason);
            errorHandler(reason).then(() => {
                process.exit(1);
            });
        })
        .on('uncaughtException', err => {
            console.error(err);
            errorHandler(err).then(() => {
                process.exit(1);
            });
        });
    console.timeEnd('Events unhandledRejection & uncaughtException');
}

