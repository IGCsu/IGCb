/**
 * Возвращает количество милисекунд с 3 цифрами после запятой с начала эпохи (01.01.1970)
 */
global.getMilliseconds = function () {
	const hrTime = Number(process.hrtime.bigint());
	return round(hrTime / 1000000, 9)
}
