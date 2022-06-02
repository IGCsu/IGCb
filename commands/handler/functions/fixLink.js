module.exports = {

	active: true,

	title: {
		ru: 'Исправление нерабочей ссылки',
		en: 'Fix broken link',
		uk: 'Виправлення неробочого посилання'
	},

	allChannels: true,
	allowedChannels: {},

	init: async function(){
		return this;
	},

	regex: /https?:\/\/media\.discordapp\.net\/\S+((\.webm)|(\.mp4))/i,

	call: async function(msg){
		if(!this.regex.test(msg.content)) return;

		await msg.delete();
		await msg.channel.send({
			content: msg.author.toString() + ': ' + msg.content.replace('media.discordapp.net', 'cdn.discordapp.com'),
			reply: {
				messageReference: msg.reference?.messageId,
				failIfNotExists: false
			}
		});
	}

}
