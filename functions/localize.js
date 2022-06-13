/**
 * Возвращает локализованный текст
 *
 * @param {String} lang Язык
 * @param {String} s Исходный текст
 * @return {String}
 */
global.localize = (lang, s) => {
	return s = global.locales[lang]?.[s] ?? s;
}
