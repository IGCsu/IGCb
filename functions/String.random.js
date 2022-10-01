const chars = 'abdehkmnpswxzABDEFGHKMNPQRSTWXZ123456789-';

/**
 * Возвращает рандомную строку
 *
 * @param {number} len Необходимая длина строки
 * @return {string}
 */
String.random = len => {
	let str = '';

	for (let i = 0; i < len; i++) {
		let pos = Math.floor(Math.random() * chars.length);
		str += chars[pos];
	}

	return str;
};
