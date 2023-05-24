module.exports = {
	
	ROLE_ID: '776934711783587841',
	MONITORING_BOT_ID: '464272403766444044',
	COOLDOWN_UP: 4*1000,

	active: true,

	title: {
		ru: 'Автоматическое упоминание людей, готовых продвигать сервер',
		en: 'Automatic mention of people who are ready to promote the server',
		uk: 'Автоматичне згадування людей, що готові просувати сервер'
	},

	allChannels: false,

	allowedChannels: {
		'949790593251414027': false // #рандом
	},

	init: async function () {
		this.role = await guild.roles.fetch(this.ROLE_ID);
		return this;
	},

	call: async function (msg) {
			
		if(msg.member.user.id !== this.MONITORING_BOT_ID) return;
		msg.log('Start pingPromoter');

		let embed;

		for(let i = 0; i < 3; i++){

			msg.log('Fetch updated message. Try ' + i)

			await sleep(1000);

			const msgUpdated = await msg.channel.messages.fetch(msg.id);
			embed = msgUpdated.embeds[0];

			if(embed) {
				msg.log('Embed found.');
				
				break;
			};

			
		};

		if(!embed.des || !embed.description.includes('Успешный Up!') || embed === null){
			msg.log('Embed is invalid.');
			
			return;
		};

		msg.log('CD started.');

		await sleep(this.COOLDOWN_UP);
		msg.log('CD finished.');

		await msg.channel.send(this.role.toString());
	}
};