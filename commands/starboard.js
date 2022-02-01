module.exports = {

	active : true,
	category : 'Голосовые каналы',

	name : 'voice',
	title : 'Управление голосовыми каналами',
	text : 'Модуль для управления голосовыми каналами.\n\nПри заходе пользователя в #Создать канал - создаётся голосовой канал, в котором у автора будут все права. Он может редактировать канал как угодно. После выхода всех пользователей, канал удаляется, настройки не сохраняются.\n\nДля передачи прав владения другому пользователю, достаточно нажать на нужного пользователя правой кнопкой мыши и в меню "Приложения" выбрать команду "voice". Выбранный пользователь получит права владения над всеми голосовыми каналами, в которых у вас есть право редактирования ролей.\n\nБот не удаляет каналы, у которых в названии в конце есть звёздочка `*`.',
	descriptionShort : 'Модуль для управления каналами',

	starboardChannel : guild.channels.cache.get('937488465585668156'),
	starboardEmoji : '⭐',
	defaultEmojiCount : 5,

	/**
	* Инициализирует прослушку необходимых ивентов.
	*
	* @return {Object}
	*/
	init : async function(path){
		if(!this.starboardChannel){
			log.error(path + ': Starboard канал не найден');
			return this;
		}

		client.on('messageReactionAdd', async (reaction, user) => await this.call(reaction, reaction.message, user));

		return this;
	},

	call : async function(reaction, message, user){
		if(reaction.emoji.name != this.starboardEmoji) return;
		if(message.channel.nsfw) return;
		if(reaction.count != this.defaultEmojiCount) return;
		if(!(await (message.reactions.cache.get(this.starboardEmoji)).users.fetch().get(client.id)))

		const embed = new Discord.MessageEmbed()
			.setAuthor({
				name: message.member?.displayName ?? message.author.name,
				iconURL: message.member?.avatarURL() ?? message.author.avatarURL(),
			})
			.setDescription(message.content)
			.setColor(16755763)
			.setURL(message.url)
			.addField('Оригинал', `[#${message.channel.name}](${message.url})`)
			.setTimestamp();
		
		if(message.attachments.size) embed.setImage(message.attachments.first().url);

		await this.starboardChannel.send({embeds: [embed]})
		await message.react(this.starboardEmoji)

	},
};