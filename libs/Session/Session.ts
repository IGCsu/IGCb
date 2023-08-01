import { Logger } from '../Logger.js';
import { Lang, LangKey } from '../Lang';

export class Session {

	public readonly lang: Lang;
	public readonly logger: Logger;
	public readonly timestamp: Date;

	public constructor (logger: Logger, lang: Lang) {
		this.timestamp = new Date();

		this.logger = logger;
		this.lang = lang;
	}

	public static init (logger: Logger, lang: Lang) {
		return new this(logger, lang);
	}

	/** Алиас для {@see Lang.str} */
	public _ (key: LangKey) {
		return this.lang.str(key);
	}

}