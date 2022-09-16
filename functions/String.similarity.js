/**
 * Возвращает коэффициент схожести с указанной строкой
 *
 * @param {string} find Искомый текст
 * @return {number}
 */
String.prototype.similarity = function(find){
	const str = this.toLowerCase();

	let coeff = find.length / str.length;

	if(str.startsWith(find)) coeff += 2 * coeff;
	if(str.endsWith(find)) coeff += 0.2 * find.length / str.length;

	return coeff;
}
