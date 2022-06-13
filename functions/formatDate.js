/**
 * Формирует дату
 *
 * @param {Date|String|Number|Boolean} date=Date Объект или метка времени. Если false или undefined - устанавливает текущее время
 * @param {Boolean} time Если true - добавляет к результату время
 * @return {String}
 */
global.formatDate = (date, time) => {

	if(!date) date = new Date();

	if(typeof date == 'string' || typeof date == 'number') date = new Date(date);

	let r = '';

	r += date.getFullYear();

	let m = date.getMonth() + 1;
	r += (m < 10 ? '-0' : '-') + m;

	let d = date.getDate();
	r += (d < 10 ? '-0' : '-') + d;

	if(time){
		let h = date.getHours();
		r += (h < 10 ? ' 0' : ' ') + h;

		let i = date.getMinutes();
		r += (i < 10 ? ':0' : ':') + i;
	}

	return r;
}
