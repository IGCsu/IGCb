/**
 * Возвращает коэффициент схожести двух строк
 * @param {String} str Исходная строка
 * @param {String} find Искомый текст
 * @return {Number}
 */
const getStringSimilarityCoeff = (str, find) => {
	str = str.toLowerCase();

	let coeff = find.length / str.length;

	if(str.startsWith(find)) coeff += 2 * coeff;
	if(str.endsWith(find)) coeff += 0.2 * find.length / str.length;

	return coeff;
}

/**
 * Используется для сортировки
 * Сравнивает на схожесть 3 строки и выдаёт разницу в коэффициенте
 *
 * @param {String} a Первая строка
 * @param {String} b Вторая строка
 * @param {String} find Искомый текст
 * @return {Number}
 */
global.getStringSimilarityDiff = (a, b, find) => {
	find = find.toLowerCase();

	return getStringSimilarityCoeff(b, find) - getStringSimilarityCoeff(a, find);
}
