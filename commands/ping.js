module.exports = {

	active : true,
	category : 'Утилиты',

	name : 'ping',
	title : {
		'ru':'Пинг',
		'en-US':'Ping',
		'uk':'Пінг',
	},
	description : {
		'ru':'Информация о боте: пинг, uptime',
		'en-US':'Bot information: ping, uptime',
		'uk':'Інформація про роботу: пінг, uptime',
	},


	init : function(){ return this; },


	embed : new Discord.MessageEmbed().setDescription('вычисление... '),


	/**
	 * Обработка команды
	 * Вычисляет пинг и время жизни бота и отправляет
	 * @param {Message|CommandInteraction} msg Сообщение или команда пользователя
	 * @param {Message} m                      Сообщение бота
	 */
	call : async function(msg, m){
		const ping = (m.createdTimestamp - msg.createdTimestamp) / 2;

		let uptime = client.uptime / 1000;

		uptime = [
			Math.floor(uptime / 3600).toString().padStart(2, '0'),
			Math.floor(uptime % 3600 / 60).toString().padStart(2, '0'),
			Math.floor(uptime % 3600 % 60).toString().padStart(2, '0')
		];

		const embed = new Discord.MessageEmbed()
			.setTitle('Pong!')
			.setDescription(`\`${ping}ms\` Uptime: ${uptime.join(':')}\n ${this.description}`);

		await m.edit({ embeds : [embed] });
	},

	/**
	 * Обработка слеш-команды
	 * @param {CommandInteraction} int Команда пользователя
	 */
	slash : async function(int){
		const m = await int.reply({ embeds : [this.embed], fetchReply: true });
		await this.call(int, m);
	},

};
