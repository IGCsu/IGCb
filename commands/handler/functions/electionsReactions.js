module.exports = {

	active: true,

	title: {
		ru: 'Прикрепление реакций ЗА и ПРОТИВ на выборах',
		en: 'Attaching reactions FOR and AGAINST in the elections',
		uk: 'Прикріплення реакцій ЗА та ПРОТИ на виборах'
	},

	allChannels: false,
	allowedChannels: {
		'612280548777525249': false // #выборы
	},

	init: async function () {
		return this;
	},

	call: async function (msg) {
		if (!msg.content.startsWith('<@') || !msg.content.endsWith('>')) return;

		try {
			await msg.react(reaction.emoji.Sg3);
			await msg.react(reaction.emoji.Sg0);
		} catch (e) {}
	}

};
