module.exports = {

	active : true,
	category : 'Модерация',

	name : 'mute',
	title : 'Модуль поддержки таймаутов',
	description : 'Используется для логгирования мутов',

	cache : {},

	/**
	* Инициализирует прослушку необходимых ивентов.
	* Находит канал #некролог.
	*
	* @return {Object}
	*/
	init : async function(path){
		this.channel = guild.channels.cache.get('634466120119877653');
		this.priveteLogs = guild.channels.cache.get('574997373219110922');

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

		if(!after.communicationDisabledUntilTimestamp) {
			const message = this.channel.messages.cache.get(this.cache[after.id]?.messageId);
			let embed = message.embeds[0];
			const description = embed.description.split('\n');
			embed.setTitle(embed.title + '(Отменён)')
			embed.setDescription(description[0] + '\n' + description[1] +
				'\nРазмут <t:' + Math.floor(Date.now()/1000) + ':R>'
			);
			await message.edit({embeds: [embed]})
			delete this.cache[after.id]
			return
		};

		const time = this.getTimeMute(after.communicationDisabledUntilTimestamp);
		const date = formatDate();
		const advancedMuteData = await this.getAdvancedMuteData(after.user);
		const text = date + ' ' + time + ' ' + member2name(after) + ' ' + after.user.id;

		let embed = new Discord.MessageEmbed()
			.setTitle(reaction.emoji.success + ' Мут выдан на ' + time)
			.setColor(2075752)
			.setTimestamp()
			.setThumbnail(after.user.avatarURL({ dynamic: true }))
			.setDescription('Пользователь: **`' + after.user.username + '#' + after.user.discriminator +
				'`**\nID пользователя: **`' + after.user.id +
				'`**\nПричина: **`' + (advancedMuteData?.reason ? advancedMuteData.reason : 'не указана') +
				'`**\nРазмут <t:' + Math.floor(after.communicationDisabledUntilTimestamp/1000) + ':R>'
			);

		if(advancedMuteData?.author) embed.setFooter({
			iconURL: advancedMuteData.author.displayAvatarURL({ dynamic: true }),
			text: advancedMuteData.author.username + '#' + advancedMuteData.author.discriminator
		});

		const msg = await this.channel.send({ embeds : [embed] });
		const thread = await msg.startThread({ name : text });

		this.cache[after.id] = {until: after.communicationDisabledUntilTimestamp, messageId: msg.id};
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
		const auditLogs = await guild.fetchAuditLogs({limit: 1, type: 24});
		let author, reason;

		const entrie = auditLogs.entries.first();
		if(!entrie) return {author: author, reason: reason};
		if(entrie.changes[0].key == 'communication_disabled_until' && entrie.target == target){
			author = entrie.executor;
			reason = entrie.reason;
		};

		return {author: author, reason: reason};
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
