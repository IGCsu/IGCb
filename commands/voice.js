module.exports = {

	active : true,
	category : 'Голосовые каналы',

	name : 'voice',
	title : 'Управление голосовыми каналами',
	text : 'Модуль для управления голосовыми каналами.\n\nПри заходе пользователя в #Создать канал - создаётся голосовой канал, в котором у автора будут все права. Он может редактировать канал как угодно. После выхода всех пользователей, канал удаляется, настройки не сохраняются.\n\nДля передачи прав владения другому пользователю, достаточно нажать на нужного пользователя правой кнопкой мыши и в меню "Приложения" выбрать команду "voice". Выбранный пользователь получит права владения над всеми голосовыми каналами, в которых у вас есть право редактирования ролей.\n\nБот не удаляет каналы, у которых в названии в конце есть звёздочка `*`.',
	descriptionShort : 'Модуль для управления каналами',

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
		const name = member2name(data.member);

		log.info(member2name(data.member, 1, 1), 'create', '#' + name);
		const channel = await data.guild.channels.create(name, {
			reason : 'По требованию ' + member2name(data.member, 1),
			parent : this.channelCategory.id,
			type : 'GUILD_VOICE',
		});

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
	}

};
