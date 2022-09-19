const SlashOptions = require('../../BaseClasses/SlashOptions');
const BaseCommand = require('../../BaseClasses/BaseCommand');
const LangSingle = require('../../BaseClasses/LangSingle');
const { VoiceState, CommandInteraction, UserContextMenuInteraction, VoiceChannel } = require('discord.js');

const slashOptions = require('./slashOptions');
const { title, sorryMessage } = require('./about.json');

class Voice extends BaseCommand{

	constructor(path) {
		super(path);

		this.category = 'Голосовые каналы'
		this.name = 'voice'
		this.title = title
		this.slashOptions = slashOptions

		this.permission = {
			MANAGE_CHANNELS : true,
			DEAFEN_MEMBERS : true,
			MUTE_MEMBERS : true,
			MOVE_MEMBERS : true,
			VIEW_CHANNEL : true,
			MANAGE_ROLES : true,
			CONNECT : true,
			STREAM : true,
			SPEAK : true,
		}

		return new Promise(async resolve => {

			guild.channels.cache.forEach(async c => {
				if (c.type !== 'GUILD_VOICE' && c.type !== 'GUILD_CATEGORY') return;
				if (c.name === 'Создать канал') {
					this.channelCreate = c;
					const mbr = this.channelCreate.members.filter(m => !m.user.bot).first();
					if (this.channelCreate.members.filter(m => !m.user.bot).size && c.type === 'GUILD_VOICE') {
						const channel = await this.create(mbr.voice);
						if (this.channelCreate.members)
							this.channelCreate.members.forEach(
								memb => {
									memb.voice.setChannel(channel).catch(reason => console.warn(reason));
									memb.send(sorryMessage['ru']).catch();
								}
							)
					}
					return;
				}
				if (c.name === 'Голосовые') return this.channelCategory = c;
				if (!c.members.filter(m => !m.user.bot).size && c.type === 'GUILD_VOICE') return this.delete(c, false, path);
			});

			if(!this.channelCategory){
				log.initText += log.error(path + ': Отсутствует категория голосовых каналов');
				this.active = false;
				return this;
			}

			if(!this.channelCreate){
				log.initText += log.warn(path + ': Отсутствует #Создать канал');
				this.channelCreate = await guild.channels.create('Создать канал', {
					parent : this.channelCategory.id,
					type : 'GUILD_VOICE'
				});
				log.initText += log.warn(path + ': Создан #Создать канал');
			}

			this.channelCreate.permissionOverwrites.cache.forEach(p => {
				if(p.type === 'member') p.delete();
			});

			client.on('voiceStateUpdate', (before, after) => this.update(before, after));
			resolve(this);
		});
	}

	/**
	 * 
	 * @param {CommandInteraction} int 
	 */
	async slash(int){
		if(int.options.getSubcommand() === 'auto-sync'){
			await int.deferReply({ephemeral: true});
			DB.query(`UPDATE users SET mode = "${int.options.getString('mode')}" WHERE id = ${int.user.id};`)[0];
			await int.editReply({content: reaction.emoji.success + ' ' +int.str('Settings changed'), ephemeral: true});
		
		} else if (int.options.getSubcommand() === 'upload') {
			if(!int.member.voice.channel) return await int.reply({content: reaction.emoji.error + ' ' + int.str('You aren\'t connect to voice channel'), ephemeral: true});
			await int.deferReply({ephemeral: true});
			await this.upload(int.member.voice);
			await int.editReply({content: reaction.emoji.success + ' ' + int.str('Voice channel configuration updated in DB'), ephemeral: true});
		
		} else if (int.options.getSubcommand() === 'sync') {
			if(!int.member.voice.channel) return await int.reply({content: reaction.emoji.error + ' ' + int.str('You aren\'t connect to voice channel'), ephemeral: true});
			await int.deferReply({ephemeral: true});
			const response = await this.sync(int.member.voice);
			const content = response === 0
				? reaction.emoji.success + ' ' + int.str('Syncing complete')
				: reaction.emoji.error + ' ' + int.str(response);
			
			await int.editReply({content: content, ephemeral: true});
		
		} else {
			await int.reply({content: int.str('In development'), ephemeral: true});
		}
	}



	/**
	 * Функция прослушки ивента обновления.
	 * Если пользователь находиться в #Создать канал - создаётся персональный канал.
	 * Если пользователь вышел из канала и в нём нет пользователей - канал удаляется.
	 *
	 * @param {VoiceState} before Предыдущий канал
	 * @param {VoiceState} after  Текущий канал
	 */
	async update(before, after){
		const state = after.channel ? after : before;
		if(state.guild.id !== guild.id) return;

		const channel = {
			before : before.channel ? before.channel : { name : 'X' },
			after : after.channel ? after.channel : { name : 'X' },
		};

		const user = state.member.toName(true, true);

		if(channel.before.id === channel.after.id) return;

		log.info(user, 'voiceState', channel.before.name + ' => ' + channel.after.name);

		if(state.member.user.bot) return; // проверка на бота

		if(channel.after.id === this.channelCreate.id) this.create(after);

		if(!before.channel || channel.before.id === this.channelCreate.id || before.channel.members.filter(m => !m.user.bot).size) return;

		this.delete(before.channel, user);
	}


	/**
	 * Создание канала
	 * Есть проверка на существование канала, в положительном случае - перекидывает в уже существующий канал.
	 * Если есть сохранённая конфигурация - выставляет её.
	 * Блокирует возможность присоединяться к #Создать канал
	 *
	 * @param {VoiceState} data
	 */
	async create(data){
		let preset
		try{
			preset = DB.query(`SELECT * FROM users WHERE id = '${data.member.id}';`)[0];
		} catch(e){
			console.log("DB error occurred:\n" + e)
		}
		if(preset) preset.voice_data = JSON.parse(preset.voice_data);
		const name = (preset?.mode !== 0 ? preset?.voice_data?.name : undefined) ?? data.member.toName();

		log.info(data.member.toName(true, true), 'create', '#' + name);
		let obj = {
			reason : 'По требованию ' + data.member.toName(true),
			parent : this.channelCategory.id,
			type : 'GUILD_VOICE'
		}
		let objFromPreset = {
			//permissionOverwrites: preset?.voice_data?.permissionOverwrites,
			bitrate: preset?.voice_data?.bitrate > guild.maximumBitrate ? guild.maximumBitrate : preset?.voice_data?.bitrate,
			userLimit: preset?.voice_data?.userLimit
		}
		if(preset?.mode !== 0) Object.assign(obj, obj, objFromPreset);
		const channel = await data.guild.channels.create(name, obj);

		channel.permissionOverwrites.create(data.member, this.permission);

		data.setChannel(channel).catch(reason => channel.delete());
		this.channelCreate.permissionOverwrites.create(data.member, { CONNECT : false });
		setTimeout(() => this.channelCreate.permissionOverwrites.delete(data.member), 60000);
		return channel;
	}




	/**
	 * Обработка контекстной команды
	 * Находит каналы, которые под владением автора команды и передаёт их указанному пользователю
	 * @param {UserContextMenuInteraction} ctx
	 */
	/*async contextUser(ctx){
		let channels = [];

		client.channels.cache.forEach(c => {
			if(c.type !== 'GUILD_VOICE' || c.name === 'Создать канал') return;

			if(!c.permissionOverwrites.cache.find(p => p.id === ctx.user.id && p.allow.has('MANAGE_ROLES'))) return;

			c.permissionOverwrites.create(ctx.targetMember, this.permission);

			channels.push('<#' + c.id + '>');
		});

		const content = channels.length
			? '<@' + ctx.targetId + '> получил права владения над каналами ' + channels.join(', ')
			: 'У вас нет каналов во владении'

		ctx.reply({ content : content, ephemeral: true });
	},*/




	/**
	 * Удаление канала
	 * Не удаляет канал, если в его названии в конце есть звёздочка
	 * @param {VoiceChannel} channel Голосовой канал
	 * @param {String}       user    Никнейм пользователя
	 * @param {String}       path    Путь к модулю
	 */
	async delete(channel, user, path){
		if(channel.name.slice(-1) === '*') return;

		const func = path
			? () => log.warn(path + ': Удалён #' + channel.name)
			: () => log.info(user, 'delete', '#' + channel.name);

		channel.delete().then(func, func);
	}

	/**
	 * Загрузка канала в БД
	 * @param {VoiceState} voice
	 */
	async upload(voice){
		let voice_data = JSON.stringify({name: voice.channel.name, bitrate: voice.channel.bitrate, userLimit: voice.channel.userLimit})
		if(DB.query(`SELECT * FROM users WHERE id = ${voice.member.user.id};`)[0]){
			DB.query(`UPDATE users SET voice_data = ? WHERE id = ${voice.member.user.id};`, [voice_data])[0];
		} else {
			DB.query(`INSERT INTO users VALUES (?, ?, ?, ?);`, [voice.member.user.id, 0, voice.channelId, voice_data])[0];
		}
	}

	/**
	 * 
	 * @param {VoiceState} voice 
	 */
	async sync(voice){
		let voiceConfiguration = JSON.parse((DB.query(`SELECT * FROM users WHERE id = ${voice.member.user.id};`)[0]).voice_data);
		if(!voiceConfiguration) return 'There is no data entry in the database associated with you. Use `/upload` to fix it.';

		if (voiceConfiguration.bitrate > voice.guild.maximumBitrate) voiceConfiguration.bitrate = voice.guild.maximumBitrate;

		await voice.channel.edit(voiceConfiguration, 'По требованию ' + voice.member.toName());
		return 0;
	}
}

module.exports = Voice;
