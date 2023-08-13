/**
 * Округляет с указанным количеством символов после запятой
 * @param value
 * @param {number} toFixed
 */
global.round = function (value, toFixed=0) {
	const powedToF = Math.pow(10, toFixed);
	return Math.round((value + Number.EPSILON) * powedToF) / powedToF;
}
