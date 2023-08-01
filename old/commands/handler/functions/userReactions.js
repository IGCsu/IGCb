module.exports = {

	active: true,

	title: {
		ru: 'Прикрепление реакций найденных в сообщении',
		en: 'Attaching reactions found in the message',
		uk: 'Прикріплення реакцій знайдених у повідомленні'
	},

	allChannels: false,
	allowedChannels: {
		'572472723624951839': false // #ивенты
	},

	init: async function () {
		return this;
	},

	regex: {
		global: /<:[^:]+:([0-9]+)>/gi,
		local: /<:[^:]+:([0-9]+)>/i
	},

	call: async function (msg) {
		const emojis = msg.content.match(this.regex.global);
		if (!emojis) return;

		try {
			emojis.forEach(emoji => {
				emoji = emoji.match(this.regex.local)[1];
				emoji = msg.guild.emojis.cache.get(emoji);
				if (emoji) msg.react(emoji);
			});
		} catch (e) {}
	}

};
