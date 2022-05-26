/** 
 * Функция для динамического усечения строк по максимальной длине
 * 
 * @param {String} str Строка для сокращения
 * @param {Number} maxlength Максимальная длина
 * 
 */

module.exports = (str, maxlength) => {
	return (str.length > maxlength) ? 
		str.slice(0, maxlength - 1) + '…' : str;
}