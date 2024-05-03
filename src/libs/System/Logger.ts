/** ANSI escape code */
export type CodeANSI = string;

export type LogStr = string | number | unknown;

export type LogData = any;

export type LogPrefix = string;

export interface CodeANSIMap
{
	[key: string]: CodeANSI;
}

export class Logger
{
	/** ANSI escape code */
	protected readonly C: CodeANSIMap = {
		RESET: '\x1b[0m', // Сброс эффектов
		BRIGHT: '\x1b[1m',
		DIM: '\x1b[2m',
		UNDERSCORE: '\x1b[4m',
		BLINK: '\x1b[5m',
		REVERSE: '\x1b[7m',
		HIDDEN: '\x1b[8m'
	};

	/** Цвета текста */
	protected readonly FG: CodeANSIMap = {
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
	protected readonly BG: CodeANSIMap = {
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

	public constructor (
		protected prefix: LogPrefix = ''
	)
	{}

	public send (color: CodeANSI, str: LogStr, data?: LogData): void
	{
		const msg = this.C.RESET + this.getCurrentTimestamp() + this.prefix + color + str + this.C.RESET;

		data ? console.log(msg, data) : console.log(msg);
	}

	public info (str: LogStr, data?: LogData): void
	{
		this.send(this.FG.CYAN, str, data);
	}

	public warn (str: LogStr, data?: LogData): void
	{
		this.send(this.FG.YELLOW, '[WARN] ' + str, data);
	}

	public error (str: LogStr, data?: LogData): void
	{
		this.send(this.FG.RED, '[ERROR] ' + str, data);
	}

	/** Возвращает временную метку в формате MySQL DATETIME */
	public getCurrentTimestamp (): string
	{
		return new Date().toJSON().replaceAll(/[TZ]/g, ' ');
	}
}