import { ru } from '../langs/ru';
import { InvalidArgumentError } from './Error/InvalidArgumentError';

/** Код локализации ISO 639-1 */
export type LangCode = string;

/** Ключ для получения локализированного текста */
export type LangKey = string;

/** Локализированный текст */
export type LangText = LangKey | string;

export interface LangData {
	[key: LangKey]: LangText;
}

export interface LangMap {
	[key: LangCode]: Lang;
}

export interface LangPostfixMap {
	[key: LangCode]: LangCode[];
}

export interface LangDiscordFormat {
	[key: LangCode]: LangText;
}

export class Lang {

	protected static readonly list: LangMap = {
		ru: new Lang('ru', ru)
	};

	public static readonly DEFAULT_LANG: LangCode = 'ru';

	/**
	 * В локализации Дискорда, некоторые языки имеют дополнительные коды, которые
	 * добавляются при конвертировании
	 */
	public static readonly LANG_POSTFIX: LangPostfixMap = {
		en: ['GB', 'US'],
		es: ['ES'],
		pt: ['BR'],
		sv: ['SE'],
		zh: ['CN', 'TW']
	};

	protected locale: LangCode;
	protected data: LangData;

	public constructor (locale: LangCode, data: LangData) {
		this.locale = locale;
		this.data = data;
	}

	/** Возвращаем ленг */
	public static get (locale?: LangCode): Lang {
		if (!locale) {
			return Lang.list[Lang.DEFAULT_LANG];
		}

		locale = locale.substring(0, 2);

		if (!Lang.list[locale]) {
			throw new InvalidArgumentError('Locale "' + locale + '" not found');
		}

		return Lang.list[locale];
	}

	/** Возвращает локализованный текст */
	public static getText (key: LangKey, locale?: LangCode): LangText {
		if (!locale) {
			locale = this.DEFAULT_LANG;
		}

		if (locale.length !== 2) {
			throw new InvalidArgumentError('Locale "' + locale + '" invalid');
		}

		return Lang.get(locale).str(key);
	}

	/** Формирует объект локализированных текстов для Дискорда */
	public static toDiscord (key: LangKey): LangDiscordFormat {
		let result: LangDiscordFormat = {};

		for (let locale in this.list) {
			if (Lang.LANG_POSTFIX.hasOwnProperty(locale)) {
				const text = this.getText(key, locale);
				for (const postfix of Lang.LANG_POSTFIX[locale]) {
					result[locale + '-' + postfix] = text;
				}
			} else {
				result[locale] = this.getText(key, locale);
			}
		}

		return result;
	}

	/** Возвращает локализованный текст */
	public str (key: LangKey): LangText {
		return this.data[key] ?? Lang.getText(key) ?? key;
	}

}