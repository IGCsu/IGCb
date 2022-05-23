const color = {
	Reset : '\x1b[0m',
	Bright : '\x1b[1m',
	Dim : '\x1b[2m',
	Underscore : '\x1b[4m',
	Blink : '\x1b[5m',
	Reverse : '\x1b[7m',
	Hidden : '\x1b[8m',
	fg : {
		Black : '\x1b[30m',
		Red : '\x1b[31m',
		Green : '\x1b[32m',
		Yellow : '\x1b[33m',
		Blue : '\x1b[34m',
		Magenta : '\x1b[35m',
		Cyan : '\x1b[36m',
		White : '\x1b[37m',
		Crimson : '\x1b[38m'
	},
	bg : {
		Black : '\x1b[40m',
		Red : '\x1b[41m',
		Green : '\x1b[42m',
		Yellow : '\x1b[43m',
		Blue : '\x1b[44m',
		Magenta : '\x1b[45m',
		Cyan : '\x1b[46m',
		White : '\x1b[47m',
		Crimson : '\x1b[48m'
	},
}

const getCurrentTimeString = () => new Date().toTimeString().replace(/ .*/, '');

const log = text => {
	console.log(text);
	return '\n' + text;
};

module.exports = {

	/**
	 * Текст лога, который отправит бот на старте.
	 * @type {String}
	 */
	initText : '',

	load : (path, perf, result) => log(path + ': ' + perf.toFixed(3) + 'ms ' + (result ? color.fg.Green + 'active' : color.fg.Red + 'inactive') + color.Reset),

	start : text => log(color.fg.Cyan + text + color.Reset),
	warn : text => log(color.fg.Yellow + text + color.Reset),
	error : text => log(color.fg.Red + text + color.Reset),

	info : (user, action, target) => {
		const actionColor = action == 'create' ? color.fg.Green
			: action == 'delete' ? color.fg.Red : color.fg.Cyan;

		return log(
			color.fg.Cyan + getCurrentTimeString() + color.Reset + ' ' +  user +
			actionColor + ' ' + action + color.Reset  + ' ' + target
		);
	},

};
