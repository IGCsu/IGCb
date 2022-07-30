/**
 * Усечение строки по максимальной длине
 *
 * @param {String} str 			Строка для сокращения
 * @param {Number} targetLength Целевая длина
 * @param {Number} type 		Добавлять пробелы до или после (0, 1)
 * @return {String}
 */
global.str2targetLength = (str, targetLength, type) => {
    return str.length > targetLength ? str.slice(0, targetLength - 1) + '…' : (type ? (str + ' '.repeat(targetLength - str.length)) : (' '.repeat(targetLength - str.length) + str));
}