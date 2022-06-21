/**
 * Устанавливает ID сессии бота
 */
module.exports = async () => {
    global.sessionId = getRandomString(32);
}

