/**
 * Возвращает исходный код функции
 * @return {string}
 */
Function.prototype.getSource = function () {
	return this.toString().split(/^[^(]*/ig)[1] ?? '';
};
