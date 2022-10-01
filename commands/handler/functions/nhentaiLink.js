module.exports = {

	active: true,

	title: {
		ru: 'Преобразование кода в ссылку',
		en: 'Convert code to link',
		uk: 'Перетворення коду на посилання'
	},

	allChannels: false,
	allowedChannels: {
		'681790010550255617': true // #nsfw
	},

	init: async function () {
		return this;
	},

	regex: /^[0-9]{2,}$/,

	call: async function (msg) {
		if (!this.regex.test(msg.content)) return;
		if (msg.author.bot) return;

		await msg.channel.send({
			content: msg.author.toString() + ': https://nhentai.net/g/' +
				msg.content + '/',
			allowedMentions: constants.AM_NONE,
			reply: {
				messageReference: msg.reference?.messageId,
				failIfNotExists: false
			}
		});
	}

};
