module.exports = {

	active: true,

	title: {
		ru: 'Автоматическое выдача alive',
		en: 'Automatic issuance of alive',
		uk: 'Автоматичне видача alive'
	},

	allChannels: false,

	allowedChannels: {
		'648775464545943602': false, // #welcome
	},

	init: async function () {
		this.alive =  await guild.roles.fetch('648762974277992448')
		return this;
	},

	match: '<@&920737134942490625>',

	call: async function (msg) {
		if (msg.content.indexOf(this.match) && !msg.member.roles.cache.has(this.alive)) {
			msg.member.roles.add(this.alive, 'Частичный снос буфера')
				.then(msg.reply({ content: reaction.emoji.success + ' Доступ к сообществу выдан' }))
				.catch((e) => {
					msg.reply({ content: reaction.emoji.error + ' Произошла ошибка при выдачи доступа к сообществу' })
				});
		}
	}

};
