/**
 * Инициализация отлова ошибок
 */
module.exports = async () => {
    console.time('Events unhandledRejection & uncaughtException');
    process
        .on('unhandledRejection', (reason, p) => {
            console.error(reason);
            errorHandler(reason);
            process.exit(1);
        })
        .on('uncaughtException', err => {
            console.error(err);
            errorHandler(err);
            process.exit(1);
        });
    console.timeEnd('Events unhandledRejection & uncaughtException');
}

