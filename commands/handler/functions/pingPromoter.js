module.exports = {

	active: true,

	title: {
		ru: 'это не моих рук дело'
	},

	allChannels: false,

	allowedChannels: {
		'610371610620198922': false, // #рандом
		'949790593251414027': false // чат тест сервера
	},

	init: async function () {
		this.role = await guild.roles.fetch('айди роли');
		return this;
	},

	call: async function (msg) {
		if(msg.member.user.id !== '464272403766444044') return;
		setTimeout(async () => {
			const msgUpdated = await msg.channel.messages.fetch(msg.id);
			const embed = msgUpdated.embeds[0];
			if(!embed.description.includes('Успешный')) return;
			console.log(embed)
			setTimeout(async () => {
				await msg.channel.send(this.role.toString())
			 }, /* 1000 */ 4*3600*1000)
		}, 1000)
	}

};