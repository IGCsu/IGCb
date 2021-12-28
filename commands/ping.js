module.exports = {

	active : true,
	category : 'Утилиты',

	name : 'ping',
	title : 'Пинг',
	description : 'Информация о боте: пинг, uptime. Пинг высчитывается с момента отправки вашего, до момента отправки сообщения бота. Время вычисления не учитывается.',
	descriptionShort : 'Информация о боте: пинг, uptime',


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

	/**
	 * Обработка традиционной команды
	 * @param {Message} msg Сообщение пользователя
	 */
	message : async function(msg){
		const m = await msg.channel.send({ embeds : [this.embed] });
		await this.call(msg, m);
	}

};
