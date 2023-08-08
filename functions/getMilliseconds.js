/**
 * Возвращает количество милисекунд с 3 цифрами после запятой с начала эпохи (01.01.1970)
 */
global.getMilliseconds = function () {
	const hrTime = process.hrtime();
	return round(hrTime[0] * 1000000000 + hrTime[1] / 1000000, 3)
}
