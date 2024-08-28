module.exports = {

	active: true,

	title: {
		ru: 'Автоматическое создание треда',
		en: 'Automatic thread creation',
		uk: 'Автоматичне створення треду'
	},

	allChannels: false,
	allowedChannels: {
		'500300930466709515': false, // #предложения
		'595198087643922445': false // #новости
	},

	init: async function () {
		return this;
	},

	regex: /^\*\*([^\n]+)\*\*\s*\n/i,

	call: async function (msg) {
		const match = msg.content.match(this.regex);
		let title = '';

		if (match) {
			title += match[1];
		} else {
			const name = msg.member.toName();
			const time = new Date(msg.createdTimestamp).toISO();
			title += name + ' ' + time;
		}

		await msg.startThread({ name: title });
	}

};
