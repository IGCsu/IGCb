/**
 * Полифил функции sleep()
 *
 * @example
 * await sleep(2000); // Код будет остановлен на 2 секунды
 *
 * @param {Number} ms Время в ms
 * @return {Promise}
 */
global.sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
