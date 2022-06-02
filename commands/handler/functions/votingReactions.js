module.exports = {

	active: true,

	title: {
		ru: 'Прикрепление реакций ЗА и ПРОТИВ',
		en: 'Addition of reactions FOR and AGAINST',
		uk: 'Приєднання реакції ЗА і ПРОТИВ'
	},

	allChannels: false,
	allowedChannels: {
		'500300930466709515': false // #предложения
	},

	init: async function(){
		return this;
	},

	call: async msg => {
		try {
			await msg.react(reaction.emoji.Sg3);
			await msg.react(reaction.emoji.Sg0);
		}catch(e){}
	}

}
