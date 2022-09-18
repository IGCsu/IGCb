/**
 * Класс локализации для одного текста
 */
class LangSingle {

	#list = {};

	/**
	 * Значение по умолчанию
	 * @type {string}
	 * @const
	 */
	static DEFAULT = 'ru';

	/**
	 * В локализации Дискорда, некоторые языки имеют дополнительные коды, которые добавляются при конвертировании
	 * @type {Object.<string, string[]>}
	 * @const
	 */
	static DISCORD_LANG_POSTFIX = {
		en: ['GB', 'US'],
		es: ['ES'],
		pt: ['BR'],
		sv: ['SE'],
		zh: ['CN', 'TW'],
	};

	/**
	 * Принимает объект с вариантами текста на разных языках.
	 * Для обозначений языков, ключей объекта используются коды языков ISO 639-1.
	 * Обязательная локализация - русский.
	 * @param {Object.<string, string>} langs
	 * @constructor
	 */
	constructor(langs){
		if(langs.hasOwnProperty(super.DEFAULT))
			throw new TypeError('No required value');

		for(const code in langs){
			if(typeof code !== 'string' || code.length !== 2)
				throw new TypeError('Incorrect lang code: ' + code);

			langs[code] = langs[code].trim();

			if(typeof langs[code] !== 'string' || langs[code].length === 0 )
				throw new TypeError('Incorrect text: ' + langs[code]);

			this.#list[code] = langs[code];
		}
	}

	/**
	 * Возвращает локализованный текст.
	 * Если не найдёт - вернёт текст на русском языке.
	 * @param {string} code Код локализации ISO 639-1
	 * @return {string}
	 */
	get(code){
		return this.has(code)
			? this.#list[code]
			: this.toString();
	}

	/**
	 * Проверяет наличие локализации
	 * @param {string} code Код локализации ISO 639-1
	 * @return {boolean}
	 */
	has(code){
		return this.#list.hasOwnProperty(code);
	}

	/**
	 * Возвращает значение по умолчанию
	 * @return {string}
	 */
	toString(){
		return this.#list[super.DEFAULT];
	}

	/**
	 * Возвращает объект локализации для Дискорда.
	 * @return {Object.<string, string>}
	 */
	toDiscord(){
		let langs = {};

		for(let code in this.#list){
			if(super.DISCORD_LANG_POSTFIX.hasOwnProperty(code)){
				for(const postfix of super.DISCORD_LANG_POSTFIX[code]){
					langs[code + '-' + postfix] = this.#list[code];
				}
			}else{
				langs[code] = this.#list[code];
			}
		}

		return langs;
	}

}

module.exports = LangSingle;