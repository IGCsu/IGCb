const { title } = require('./about.json');

module.exports = {

	active : true,
	category : 'Логирование',

	name : 'necrology',
	title : title,

	cache : {},

	/**
	* Инициализирует прослушку необходимых ивентов.
	* Находит канал #некролог.
	*
	* @return {Object}
	*/
	init : async function(path){
		this.channel = guild.channels.cache.get('500010381490782238');
		this.debugChannel = guild.channels.cache.get('634466120119877653');
		this.priveteLogs = guild.channels.cache.get('574997373219110922');

		if(!this.channel){
			log.initText += log.error(path + ': Отсутствует #некролог');
			this.active = false;
			return this;
		}

		if(!this.debugChannel){
			log.initText += log.error(path + ': Отсутствует #канал-для-тестов');
			this.active = false;
			return this;
		}

		client.on('guildMemberUpdate', (before, after) => this.update(before, after));
		client.on('guildBanAdd', ban => this.ban(ban));

		return this;
	},




	/**
	 * Функция прослушки ивента бана.
	 * Отправляет инфу о бане в #некролог
	 *
	 * @param {GuildBan} ban Объект бана
	 */
	ban : async function(ban){
		const text = 'BAN ' + ban.user.username + '#' + ban.user.discriminator + ' ' + ban.user.id;
		let channel = 'channel';

		let embed = new Discord.MessageEmbed()
			.setTitle(reaction.emoji.banhammer + ' Бан')
			.setColor(0x808080)
			.setTimestamp()
			.setThumbnail(ban.user.avatarURL({ dynamic: true }));
		try {
			const auditLogs = await guild.fetchAuditLogs({ limit : 1, type : 22 });
			const entrie = auditLogs.entries.first();

			if(entrie){
				embed.setFooter({
					iconURL : entrie.executor.displayAvatarURL({ dynamic: true }),
					text : entrie.executor.username + '#' + entrie.executor.discriminator
				})
				embed.setDescription(
					'Пользователь: **`' + ban.user.username + '#' + ban.user.discriminator +
					'`**\nID пользователя: **`' + ban.user.id +
					'`**\nПричина: **`' + (entrie.reason ? entrie.reason : 'не указана') + '`**'
				);
				if(entrie.reason && /\((test|тест)\)/.test(entrie.reason)) channel = 'debugChannel';
			}
		}catch(e){}

		const msg = await this[channel].send({ embeds : [embed] });
		const thread = await msg.startThread({ name : text });
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
		const advancedMuteData = await this.getAdvancedTimeoutData(after.user);
		if(!after.communicationDisabledUntilTimestamp) {
			const message = this.channel.messages.cache.get(this.cache[after.id]?.messageId);
			if(!message || !message.embeds) return;
			let embed = message.embeds[0];
			const description = embed.description.split('\n');
			embed.setTitle(embed.title + ' (Отменён)')
			embed.setDescription(description[0] + '\n' + description[1] + '\n' + description[2] +
				'\n**Размут** <t:' + Math.floor(Date.now()/1000) + ':R>' +
				`\n**Отменил:** <@${advancedMuteData?.author.id}>`
			);
			embed.setColor(5131854)
			await message.edit({embeds: [embed]})
			delete this.cache[after.id]
			return
		};

		const time = this.getTimeMute(after.communicationDisabledUntilTimestamp);
		const date = formatDate();
		const text = date + ' ' + time + ' ' + member2name(after) + ' ' + after.user.id;

		let embed = new Discord.MessageEmbed()
			.setTitle(reaction.emoji.success + ' Мут выдан на ' + time)
			.setColor(2075752)
			.setTimestamp()
			.setThumbnail(after.user.avatarURL({ dynamic: true }))
			.setDescription('**Пользователь:** <@' + after.user.id + '>' +
				'\n**ID пользователя:** `' + after.user.id +
				'`\n**Причина:** `' + (advancedMuteData?.reason ? advancedMuteData.reason : 'не указана') +
				'`\n**Размут** <t:' + Math.floor(after.communicationDisabledUntilTimestamp/1000) + ':R>'
			);

		if(advancedMuteData?.author) embed.setFooter({
			iconURL: advancedMuteData.author.displayAvatarURL({ dynamic: true }),
			text: advancedMuteData.author.username + '#' + advancedMuteData.author.discriminator
		});

		const channel = (advancedMuteData?.reason && /\((test|тест)\)/.test(advancedMuteData.reason)) ? 'debugChannel' : 'channel';

		const msg = await this[channel].send({ embeds : [embed] });
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
	getAdvancedTimeoutData : async function(target){
		const auditLogs = await guild.fetchAuditLogs({limit: 1, type: 24});
		let result = { author : undefined, reason : undefined};

		const entrie = auditLogs.entries.first();
		if(!entrie) return result;
		if(entrie.changes[0].key == 'communication_disabled_until' && entrie.target == target){
			result.author = entrie.executor;
			result.reason = entrie.reason;
		};

		return result;
	},

	getTimeMute : function(timestamp){
		const difference = (timestamp - Date.now()) / 1000;

		const minutes = Math.round( (difference/60) % 60 );
		const hours = Math.round( (difference/3600) % 24 );
		const days = Math.round(difference/86400);
		const weeks = +(days/7).toFixed(1);

		if(weeks >= 1) return weeks + 'w';
		if(days > 0) return days + 'd';
		if(hours > 0) return hours + 'h';
		if(minutes > 0) return minutes + 'm';
		return difference + 's';
	},

};
