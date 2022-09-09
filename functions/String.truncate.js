/**
 * Форматирует строку до указанной длинны.
 * Дополнительно можно указать символ отступа слева или справа.
 *
 * @param {number} length Длинна строки
 * @param {Object} [margin]
 * @param {string} [margin.left] Символ отступа слева
 * @param {string} [margin.right] Символ отступа справа
 * @return {string}
 */
String.prototype.truncate = function(length, margin){
	if(this.length > length){
		return this.slice(0, length - 1) + '…';
	}

	let str = this;
	let value = length - this.length;

	if(margin?.left && margin?.right) value = value / 2;

	if(margin?.left){
		str = margin.left[0].repeat(Math.ceil(value)) + str;
	}

	if(margin?.right){
		str += margin.right[0].repeat(Math.floor(value));
	}

	return str;
}