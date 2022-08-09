/**
 * Формирует строку в стандарт ISO 8601 (YYYY-MM-DD)
 * Дополнительный параметр позволяет дополнить строку временем (hh:mm)
 * @param {boolean} [time=false]
 * @return {string}
 */
Date.prototype.toISO = function(time){
	let str = '';

	str += this.getFullYear();

	let m = this.getMonth() + 1;
	str += m < 10 ? '-0' : '-';
	str += m;

	let d = this.getDate();
	str += d < 10 ? '-0' : '-';
	str += d;

	if(time){
		let h = this.getHours();
		str += h < 10 ? ' 0' : ' ';
		str += h;

		let i = this.getMinutes();
		str += i < 10 ? ':0' : ':';
		str += i;
	}

	return str;
}
