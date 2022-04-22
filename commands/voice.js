module.exports = {

	active : true,
	category : 'Голосовые каналы',

	name : 'voice',
	title : 'Управление голосовыми каналами',
	text : 'Модуль для управления голосовыми каналами.\n\nПри заходе пользователя в #Создать канал - создаётся голосовой канал, в котором у автора будут все права. Он может редактировать канал как угодно. После выхода всех пользователей, канал удаляется, настройки не сохраняются.\n\nДля передачи прав владения другому пользователю, достаточно нажать на нужного пользователя правой кнопкой мыши и в меню "Приложения" выбрать команду "voice". Выбранный пользователь получит права владения над всеми голосовыми каналами, в которых у вас есть право редактирования ролей.\n\nБот не удаляет каналы, у которых в названии в конце есть звёздочка `*`.',
	descriptionShort : 'Module for voice channel management',
	description_localizations : {'ru': 'Модуль для управления голосовыми каналами', 'uk': 'Модуль для управління голосовими каналами'},

	permission : {
		MANAGE_CHANNELS : true,
		DEAFEN_MEMBERS : true,
		MUTE_MEMBERS : true,
		MOVE_MEMBERS : true,
		VIEW_CHANNEL : true,
		MANAGE_ROLES : true,
		CONNECT : true,
		STREAM : true,
		SPEAK : true,
	},

	slashOptions : [
		{
			name : 'sync',
			description : 'Synchronize the channel with the database',
			description_localizations : {'ru': 'Синхронизовать канал с базой данных', 'uk': 'Синхронізувати канал з базою даних'},
			type : 1,
		},
		{
			name : 'upload',
			description : 'Upload the configuration to the database',
			description_localizations : {'ru': 'Загрузить конфигруацию в базу данных', 'uk': 'Завантажити конфігурацію в базу даних'},
			type : 1,
		},
		{
			name : 'auto-sync',
			description : 'Setting up auto-synchronization',
			description_localizations : {'ru': 'Настройка автосинхронизации', 'uk': 'Настройка автосинхронизации'},
			type : 1,
			options : [
				{
					name : 'mode',
					name_localizations : {'ru': 'режим', 'uk': 'режим'},
					description : 'Select auto sync mode',
					description_localizations : {'ru': 'Выберите режим автосинхронизации', 'uk': 'Виберіть режим автосинхронізації'},
					type : 3,
					choices: [
						{value: '0', name: 'Disabled', name_localizations: {'ru': 'Отключена', 'uk': 'Відключений'}},
						{value: '1', name: 'Partial (Settings are loaded from the DB only when creating a VC)', name_localizations: {'ru': 'Частичная (Настройки выгружаются из БД только при создании ГС)', 'uk': 'Часткова (Налаштування вивантажуються з БД тільки при створенні ГС)'}},
						{value: '2', name: 'Full', name_localizations: {'ru': 'Полная', 'uk': 'Полная'}},
					],
					required : true,
				}
			]
		},
		{
			name : 'add-owner',
			description : 'Grant channel management perms',
			description_localizations : {'ru': 'Дать права на управление каналом', 'uk': 'Дати права на управління каналоми'},
			type : 1,
			options : [
				{
					name : 'member',
					name_localizations : {'ru': 'пользователь', 'uk': 'користувач'},
					description : 'The user to whom the perms will be granted',
					description_localizations : {'ru': 'Пользователь которому будут выданы права', 'uk': 'Користувач якому будуть видані права'},
					type : 6,
					required : true,
				}
			]
		},
	],

	/**
	* Инициализирует прослушку необходимых ивентов.
	* Находит категорию голосовых и #Создать канал. Создаёт его, если не находит.
	*
	* @return {Object}
	*/
	init : async function(path, logText){
		guild.channels.cache.forEach(c => {
			if(c.type != 'GUILD_VOICE' && c.type != 'GUILD_CATEGORY') return;
			if(c.name == 'Создать канал') return this.channelCreate = c;
			if(c.name == 'Голосовые') return this.channelCategory = c;
			if(!c.members.filter(m => !m.user.bot).size && c.type == 'GUILD_VOICE') return this.delete(c, false, path);
		});

		if(!this.channelCategory){
			logText += log.error(path + ': Отсутствует категория голосовых каналов');
			this.active = false;
			return this;
		}

		if(!this.channelCreate){
			logText += log.warn(path + ': Отсутствует #Создать канал');
			this.channelCreate = await guild.channels.create('Создать канал', {
				parent : this.channelCategory.id,
				type : 'GUILD_VOICE'
			});
			logText += log.warn(path + ': Создан #Создать канал');
		}

		this.channelCreate.permissionOverwrites.cache.forEach(p => {
			if(p.type == 'member') p.delete();
		});

		client.on('voiceStateUpdate', (before, after) => this.update(before, after));

		return this;
	},


	slash: async function(int){
		if(int.options.getSubcommand() == 'auto-sync'){
			DB.query(`UPDATE users SET mode = "${int.options.getString('mode')}" WHERE id = ${int.user.id};`)[0];
			await int.reply({content: reaction.emoji.success + ' ' +localize(int.locale, 'Settings changed'), ephemeral: true});
		} else if (int.options.getSubcommand() == 'upload') {
			if(!int.member.voice.channel) return await int.reply({content: reaction.emoji.error + ' ' + localize(int.locale, 'You aren\'t connect to voice channel'), ephemeral: true});
			await this.upload(int.member.voice);
			await int.reply({content: reaction.emoji.success + ' ' + localize(int.locale, 'Voice channel configuration updated in DB'), ephemeral: true});
		} else {
			await int.reply({content: localize(int.locale, 'In development'), ephemeral: true});
		}
	},



	/**
	 * Функция прослушки ивента обновления.
	 * Если пользователь находиться в #Создать канал - создаётся персональный канал.
	 * Если пользователь вышел из канала и в нём нет пользователей - канал удаляется.
	 *
	 * @param {VoiceState} before Предыдущий канал
	 * @param {VoiceState} after  Текущий канал
	 */
	update : async function(before, after){
		const state = after.channel ? after : before;
		if(state.guild.id != config.home) return;

		const channel = {
			before : before.channel ? before.channel : { name : 'X' },
			after : after.channel ? after.channel : { name : 'X' },
		};

		const user = member2name(state.member, 1, 1);

		if(channel.before.id == channel.after.id) return;

		log.info(user, 'voiceState', channel.before.name + ' => ' + channel.after.name);

		if(state.member.user.bot) return; // проверка на бота

		if(channel.after.id == this.channelCreate.id) this.create(after);

		if(!before.channel || channel.before.id == this.channelCreate.id || before.channel.members.filter(m => !m.user.bot).size) return;

		this.delete(before.channel, user);
	},






	/**
	 * Создание канала
	 * Есть проверка на существование канала, в положительном случае - перекидывает в уже существующий канал.
	 * Если есть сохранённая конфигурация - выставляет её.
	 * Блокирует возможность присоединяться к #Создать канал
	 *
	 * @param {VoiceState} data
	 */
	create : async function(data){
		let preset = DB.query(`SELECT * FROM users WHERE id = '${data.member.id}';`)[0];
		if(perset) preset.voice_data = JSON.parse(preset.voice_data);
		const name = (preset?.mode != 0 ? preset?.voice_data?.name : undefined) ?? member2name(data.member);

		log.info(member2name(data.member, 1, 1), 'create', '#' + name);
		let obj = {
			reason : 'По требованию ' + member2name(data.member, 1),
			parent : this.channelCategory.id,
			type : 'GUILD_VOICE'
		}
		let objFromPreset = {
			//permissionOverwrites: preset?.voice_data?.permissionOverwrites,
			bitrate: preset?.voice_data?.bitrate > guild.maximumBitrate ? guild.maximumBitrate : preset?.voice_data?.bitrate,
			userLimit: preset?.voice_data?.userLimit
		}
		if(preset?.mode != 0) Object.assign(obj, obj, objFromPreset);
		const channel = await data.guild.channels.create(name, obj);

		channel.permissionOverwrites.create(data.member, this.permission);

		data.setChannel(channel).catch(reason => channel.delete());
		this.channelCreate.permissionOverwrites.create(data.member, { CONNECT : false });
		setTimeout(() => this.channelCreate.permissionOverwrites.delete(data.member), 60000);
	},




	/**
	 * Обработка контекстной команды
	 * Находит каналы, которые под владением автора команды и передаёт их указанному пользователю
	 * @param {UserContextMenuInteraction} ctx
	 */
	contextUser : async function(ctx){
		let channels = [];

		client.channels.cache.forEach(c => {
			if(c.type != 'GUILD_VOICE' || c.name == 'Создать канал') return;

			if(!c.permissionOverwrites.cache.find(p => p.id === ctx.user.id && p.allow.has('MANAGE_ROLES'))) return;

			c.permissionOverwrites.create(ctx.targetMember, this.permission);

			channels.push('<#' + c.id + '>');
		});

		const content = channels.length
			? '<@' + ctx.targetId + '> получил права владения над каналами ' + channels.join(', ')
			: 'У вас нет каналов во владении'

		ctx.reply({ content : content, ephemeral: true });
	},




	/**
	 * Удаление канала
	 * Не удаляет канал, если в его названии в конце есть звёздочка
	 * @param {VoiceChannel} channel Голосовой канал
	 * @param {String}       user    Никнейм пользователя
	 * @param {String}       path    Путь к модулю
	 */
	delete : async function(channel, user, path){
		if(channel.name.slice(-1) == '*') return;

		const func = path
			? () => log.warn(path + ': Удалён #' + channel.name)
			: () => log.info(user, 'delete', '#' + channel.name);

		channel.delete().then(func, func);
	},

	/**
	 * Загрузка канала в БД
	 * @param {VoiceState} voice
	 */
	upload : async function(voice){
		let voice_data = JSON.stringify({name: voice.channel.name, bitrate: voice.channel.bitrate, userLimit: voice.channel.userLimit})
		if(DB.query(`SELECT * FROM users WHERE id = ${voice.member.user.id};`)[0]){
			DB.query(`UPDATE users SET voice_data = ? WHERE last_channel_id = ${voice.channel.id};`, [voice_data])[0];
		} else {
			DB.query(`INSERT INTO users VALUES (?, ?, ?, ?);`, [voice.member.user.id, 0, voice.channelId, voice_data])[0];
		}
	},

};
