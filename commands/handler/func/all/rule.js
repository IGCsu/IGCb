const fetch = require('node-fetch');

(async () => {
	try{

		const rules = await (await fetch('https://igc.su/rules?j=true')).json();

		/**
		 * Отправляет текст пункта Устава
		 *
		 * @param {Message} msg Сообщение пользователя
		 */
		module.exports = async msg => {
			if(msg.content.length < 2) return;
			msg.content = msg.content.replace('а', 'a');
			msg.content = msg.content.replace(/^r\.?/, '');
			if(!rules[msg.content]) return;
			await msg.channel.send({
				content: 'https://igc.su/rules?f=' + msg.content,
				messageReference: msg.reference?.messageId
			});
		};

	}catch(e){
		module.exports = false;
	}
})()
