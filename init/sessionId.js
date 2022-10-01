/**
 * Устанавливает ID сессии бота
 */
module.exports = async () => {
	global.sessionId = String.random(32);
};

