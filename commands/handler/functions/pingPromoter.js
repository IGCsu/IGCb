module.exports = {
	
	ROLE_ID: '1107382381700206672',
	MONITORING_BOT_ID: '464272403766444044',
	COOLDOWN_UP: 4*3600*1000,

	active: true,

	title: {
		ru: 'Автоматическое упоминание людей, готовых продвигать сервер',
		en: 'Automatic mention of people who are ready to promote the server',
		uk: 'Автоматичне згадування людей, що готові просувати сервер'
	},

	allChannels: false,

	allowedChannels: {
		'610371610620198922': false // #рандом
	},

	init: async function () {
		this.role = await guild.roles.fetch(this.ROLE_ID);
		return this;
	},

	call: async function (msg) {
		
		if(msg.member.user.id !== this.MONITORING_BOT_ID) return;
		console.log('Бот обнаружил сообщение от мониторинга');

		let embed;

		console.log('Бот начал процедуру проверки соообщения');
		for(let i = 0; i < 3; i++){

			console.log('Проверка номер', i)

			await sleep(1000);

			const msgUpdated = await msg.channel.messages.fetch(msg.id);
			embed = msgUpdated.embeds[0];

			if(embed) {
				console.log('Бот нашел эмбид. (ID сообщения = ' + msg.id + ')');
				
				break;
			};

			
		};

		if(!embed || !embed.description.includes('Успешный Up!')){
			console.log('Эмбид из данного сообщения не является условием запуска таймера');
			
			return;
		};

		console.log('Таймер запущен');

		await sleep(this.COOLDOWN_UP);
		console.log('Таймер прошел');

		await msg.channel.send(this.role.toString());
	}
};