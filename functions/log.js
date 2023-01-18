/**
 * Объект кодов эффектов в консоли
 * @type {Object}
 */
const f = {

	/**
	 * Сброс эффектов
	 */
	Reset: '\x1b[0m',

	Bright: '\x1b[1m',
	Dim: '\x1b[2m',
	Underscore: '\x1b[4m',
	Blink: '\x1b[5m',
	Reverse: '\x1b[7m',
	Hidden: '\x1b[8m',

	/**
	 * Цвета текста
	 * @type {Object}
	 */
	fg: {
		Black: '\x1b[30m',
		Red: '\x1b[31m',
		Green: '\x1b[32m',
		Yellow: '\x1b[33m',
		Blue: '\x1b[34m',
		Magenta: '\x1b[35m',
		Cyan: '\x1b[36m',
		White: '\x1b[37m',
		Crimson: '\x1b[38m'
	},

	/**
	 * Цвета текста
	 * @type {Object}
	 */
	bg: {
		Black: '\x1b[40m',
		Red: '\x1b[41m',
		Green: '\x1b[42m',
		Yellow: '\x1b[43m',
		Blue: '\x1b[44m',
		Magenta: '\x1b[45m',
		Cyan: '\x1b[46m',
		White: '\x1b[47m',
		Crimson: '\x1b[48m'
	}

};

const getCurrentTimestamp = () => new Date()
	.toISOString()
	.replace(/\..*/, '')
	.replace('T', ' ');

/**
 * Отправка текста в консоль и возвращение текста с новой строки
 * @param {String} text
 * @returns {String}
 */
const logText = text => {
	console.log(text);
	return '\n' + text;
};

global.log = {

	/**
	 * Текст лога, который отправит бот на старте.
	 * @type {String}
	 */
	initText: '',

	/**
	 * Логгирование загрузки
	 * @param {String} path Путь к файлу
	 * @param {Number} perf Время загрузки файла
	 * @param {Boolean} result Результат
	 * @returns {String}
	 */
	load: (path, perf, result) => {
		const status = result ? f.fg.Green + 'active' : f.fg.Red + 'inactive';
		return logText(path + ': ' + perf.toFixed(3) + 'ms ' + status + f.Reset);
	},

	/**
	 * Стартовое сообщение
	 * @param {String} text
	 * @returns {String}
	 */
	start: text => logText(f.fg.Cyan + text + f.Reset),

	/**
	 * Сообщение предупреждения
	 * @param {String} text
	 * @returns {String}
	 */
	warn: text => logText(f.fg.Yellow + text + f.Reset),

	/**
	 * Стартовое ошибки
	 * @param {String} text
	 * @returns {String}
	 */
	error: text => logText(f.fg.Red + text + f.Reset),

	/**
	 * Логгирование голосовых каналов
	 * @param {String} user Имя юзера
	 * @param {String} action Тип действия
	 * @param {String} target ID голосового канала
	 * @returns {String}
	 */
	info: (user, action, target) => {
		const actionColor = action === 'create' ? f.fg.Green
			: action === 'delete' ? f.fg.Red : f.fg.Cyan;

		return logText(
			f.fg.Cyan + getCurrentTimestamp() + f.Reset + ' ' + user +
			actionColor + ' ' + action + f.Reset + ' ' + target
		);
	}

};

/**
 * Инициализирует логгер для интерации
 * Создаёт функцию log для экземпляра Interaction
 *
 * @example int.log('string', data);
 * @param {Object} int
 * @param {string} name Название команды
 */
global.initLog = (int, name) => {

	let prefix = ' ' + int.indexFunc + ' ';

	if (int.isCommand()) prefix += '/';
	if (int.isContextMenu()) prefix += '#';

	/**
	 * Логгирует текст
	 * @example int.log('string', data);
	 *
	 * @param {string} str
	 * @param {any}      [data]
	 */
	int.log = (str, data) => {
		let json = data ? '\n' + JSON.stringify(data) : '';

		return logText(
			f.fg.Cyan + getCurrentTimestamp() + f.Reset + ' ' +
			int.member.user.id + f.fg.Cyan + prefix + name +
			f.Reset + ' ' + str + json
		);
	};

	let args = '';

	if (int?.options?.data) {
		for (const option of int.options.data) {
			args += option.name + ':' + f.fg.Cyan + '"' + option.value + '" ' +
				f.Reset;
		}
	}

	int.log(args);
};
