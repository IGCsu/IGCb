/**
 * Формирует дату
 *
 * @param  {String} lang Язык
 * @param  {String}             s Исходный текст
 * @return {String}
 */
 module.exports = (lang, s) => {
	return s = global.locales[lang]?.[s] ?? s;
};
