/**
 * Конвертирует строку
 * Дополнительно можно указать символ отступа слева или справа.
 *
 * @return {string}
 */
global.dec2hex = function (dec, targetLength=6, addHashtag=true) {
	let hex = dec.toString(16)
	const dif = Math.max(targetLength - hex, 0)
	hex = "0".repeat(dif) + hex
	if (addHashtag) hex = "#" + hex
	return hex;
};