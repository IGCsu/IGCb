/**
 * Установка статуса бота
 */
module.exports = async () => {
    await client.user.setActivity('/help', { type: 'LISTENING' });
}