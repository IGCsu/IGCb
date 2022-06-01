const chrs = 'abdehkmnpswxzABDEFGHKMNPQRSTWXZ123456789-';

/**
 * Возвращает рандомную строку
 *
 * @param  {Number} len Необходимая длина строки
 * @return {String}
 */
module.exports = len => {
	let str = '';

	for(let i = 0; i < len; i++){
		let pos = Math.floor(Math.random() * chrs.length);
		str += chrs[pos];
	}

	return str;
};
