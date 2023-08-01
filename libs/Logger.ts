import { Snowflake } from 'discord-api-types/v6';

/** ANSI escape code */
export type CodeANSI = string;

/** Текст лога */
export type LogStr = string | number | unknown;

/** Данные лога */
export type LogData = any;

/** Префикс лога */
export type LogPrefix = string;

export interface CodeANSIMap {
	[key: string]: CodeANSI;
}

export class Logger {

	/** ANSI escape code */
	protected static readonly C: CodeANSIMap = {
		RESET: '\x1b[0m', // Сброс эффектов
		BRIGHT: '\x1b[1m',
		DIM: '\x1b[2m',
		UNDERSCORE: '\x1b[4m',
		BLINK: '\x1b[5m',
		REVERSE: '\x1b[7m',
		HIDDEN: '\x1b[8m'
	};

	/** Цвета текста */
	protected static readonly FG: CodeANSIMap = {
		BLACK: '\x1b[30m',
		RED: '\x1b[31m',
		GREEN: '\x1b[32m',
		YELLOW: '\x1b[33m',
		BLUE: '\x1b[34m',
		MAGENTA: '\x1b[35m',
		CYAN: '\x1b[36m',
		WHITE: '\x1b[37m',
		CRIMSON: '\x1b[38m'
	};

	/** Цвет фона */
	protected static readonly BG: CodeANSIMap = {
		BLACK: '\x1b[40m',
		RED: '\x1b[41m',
		GREEN: '\x1b[42m',
		YELLOW: '\x1b[43m',
		BLUE: '\x1b[44m',
		MAGENTA: '\x1b[45m',
		CYAN: '\x1b[46m',
		WHITE: '\x1b[47m',
		CRIMSON: '\x1b[48m'
	};

	/** Возвращает временную метку в формате MySQL DATETIME */
	public static getCurrentTimestamp (): string {
		return new Date().toTimeString().replace(/ .*/, '');
	}

	/** Префикс лога */
	protected prefix: LogPrefix = '';

	public constructor (prefix: LogPrefix) {
		this.prefix = prefix;
	}

	public static initFromUser (userId: Snowflake): Logger {
		return new this('[' + userId + ']');
	}

	/** Отправляет сообщение в лог */
	public static send (color: CodeANSI, str: LogStr, data?: LogData, prefix?: LogPrefix) {
		data = data ? '\n' + JSON.stringify(data) : '';

		if (!prefix) {
			prefix = '';
		}

		console.log(this.C.RESET + this.getCurrentTimestamp() + prefix + ' ' + color + str + data + this.C.RESET);
	}

	/** Отправляет сообщение в лог */
	public send (color: CodeANSI, str: LogStr, data?: LogData) {
		Logger.send(color, str, data, this.prefix);
	}

	/** Отправляет сообщение информации в лог */
	public static info (str: LogStr, data?: LogData, prefix?: LogPrefix) {
		this.send(this.FG.CYAN, str, data, prefix);
	}

	/** Отправляет сообщение информации в лог */
	public info (str: LogStr, data?: LogData) {
		Logger.info(str, data, this.prefix);
	}

	/** Отправляет сообщение предупреждения в лог */
	public static warn (str: LogStr, data?: LogData, prefix?: LogPrefix) {
		this.send(this.FG.YELLOW, '[WARN] ' + str, data, prefix);
	}

	/** Отправляет сообщение предупреждения в лог */
	public warn (str: LogStr, data?: LogData) {
		Logger.warn(str, data, this.prefix);
	}

	/** Отправляет сообщение ошибки в лог */
	public static error (str: LogStr, data?: LogData, prefix?: LogPrefix) {
		this.send(this.FG.RED, '[ERROR] ' + str, data, prefix);
	}

	/** Отправляет сообщение ошибки в лог */
	error (str: LogStr, data?: LogData) {
		Logger.error(str, data, this.prefix);
	}

}