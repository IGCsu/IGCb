const fetch = require('node-fetch');

module.exports = {

	active: true,

	title: {
		ru: 'Отправляет текст пункта Устава',
		en: 'Sends the text of the clause of the Charter',
		uk: 'Надсилає текст пункту Статуту'
	},

	allChannels: true,
	allowedChannels: {},

	init: async function(){
		try{
			this.rules = await (await fetch('https://igc.su/rules?j=true')).json();
		}catch(e){
			this.active = false;
		}

		return this;
	},

	call: async function(msg){
		if(msg.content.length < 2) return;

		msg.content = msg.content.replace('а', 'a');
		msg.content = msg.content.replace(/^r\.?/, '');

		if(!this.rules[msg.content]) return;

		await msg.channel.send({
			content: 'https://igc.su/rules?f=' + msg.content,
			messageReference: msg.reference?.messageId
		});
	}

}
