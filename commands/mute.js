module.exports = {

	active : true,
	category : 'Модерация',

	name : 'mute',
	title : 'Модуль поддержки таймаутов',
	description : 'Используется для логгирования мутов',

	/**
	* Инициализирует прослушку необходимых ивентов.
	* Находит канал #некролог.
	*
	* @return {Object}
	*/
	init : async function(path){
		this.channel = guild.channels.cache.get('634466120119877653');

		if(!this.channel){
			log.error(path + ': Отсутствует #некролог');
			this.active = false;
			return this;
		}

		client.on('guildMemberUpdate', (before, after) => this.update(before, after));

		return this;
	},





	/**
	 * Функция прослушки ивента обновления.
	 * Срабатывает лишь на те ивенты, когда пользователя мутят.
	 *
	 * @param {GuildMember} before Юзер до обновления
	 * @param {GuildMember} after  Юзер после обновления
	 */
	update : async function(before, after){
		if(before.communicationDisabledUntilTimestamp == after.communicationDisabledUntilTimestamp) return;

		if(!after.communicationDisabledUntilTimestamp) return;

		const time = this.getTimeMute(after.communicationDisabledUntilTimestamp);
		const date = formatDate();
		const { author, reason } = this.getAdvancedMuteData(after.user);
		const text = date + ' ' + time + ' ' + member2name(after) + ' ' + after.user.id;

		let embed = new Discord.MessageEmbed()
			.setTitle(reaction.emoji.success + ' Мут выдан на ' + time)
			.setColor(2075752)
			.setTimestamp()
			.setThumbnail(after.user.avatarURL({ dynamic: true }))
			.setFooter({ iconURL: author.user.avatarURL({ dynamic: true }), text: author.username + '#' + author.discriminator })
			.setDescription('Пользователь: **`' + after.user.username + '#' + after.user.discriminator +
				'`**\nПричина: **`' + reason +
				'`**\n Осталось: <t:' + after.communicationDisabledUntilTimestamp + ':R>'
			);

		const msg = await this.channel.send({ embeds : [embed] });
		const thread = await msg.startThread({ name : text });
	},

	/**
	* Функция получения данных из Аудит лога.
	*
	* @param {User} target Цель поиска
	*
	* @returns {User} author автор мута
	* @returns {string} reason причина мута
	*/
	getAdvancedMuteData : async function(target){
		const auditLogs = await guild.fetchAuditLogs({limit: 10, type: 24});
		let author, reason;

		for(const entrie of auditLogs.entries){
			if(entrie.changes[0].key == 'communication_disabled_until' && entrie.target == target){
				author = entrie.executor;
				reason = entrie.reason;
			};
		};
		return author, reason;
	},


	getTimeMute : function(timestamp){
		const difference = (timestamp - Date.now()) / 1000;

		const minutes = Math.round( (difference/60) % 60 );
		const hours = Math.round( (difference/3600) % 24 );
		const days = Math.round(difference/86400);
		const weeks = +(days/7).toFixed(1);

		if(weeks > 0) return weeks + 'w';
		if(days > 0) return days + 'd';
		if(hours > 0) return hours + 'h';
		if(minutes > 0) return minutes + 'm';
		return difference + 's';
	},

};
