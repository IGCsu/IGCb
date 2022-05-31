/**
 * Полифил функции sleep()
 *
 * @param  {Number}  ms Время в ms
 * @return {Promise}
 */
module.exports = ms => new Promise(resolve => setTimeout(resolve, ms));
