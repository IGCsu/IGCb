/** 
 * Усечение строки по максимальной длине
 * 
 * @param {String} str Строка для сокращения
 * @param {Number} maxlength Максимальная длина
 * @return {String}
 */
global.truncate = (str, maxlength) => {
	return str.length > maxlength ? str.slice(0, maxlength - 1) + '…' : str;
}