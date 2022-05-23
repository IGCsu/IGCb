const { title } = require('./about.json');

module.exports = {

	active : true,
	category : 'Голосовые каналы',

	name : 'starboard',
	title : title,

	starboardChannel : guild.channels.cache.get('938171284553101456'),
	starboardEmoji : '⭐',
	defaultEmojiCount : 7,

	/**
	* Инициализирует прослушку необходимых ивентов.
	*
	* @return {Object}
	*/
	init : async function(path){
		if(!this.starboardChannel){
			log.initText += log.error(path + ': Starboard канал не найден');
			return this;
		}

		client.on('raw', async (data) => {
			if(data.t != 'MESSAGE_REACTION_ADD') return;
			const reaction = data.d
			if(reaction.emoji.name != this.starboardEmoji) return;
			const message = await ((await (client.channels.fetch(data.d.channel_id))).messages.fetch(data.d.message_id))
			await this.call(message.reactions.cache.get(reaction.emoji.name), message);
		});

		return this;
	},

	call : async function(reaction, message){
		if(message.channel.nsfw) return;
		if(message.channel == this.starboardChannel) return;
		if(reaction.count < this.defaultEmojiCount) return;
		const users = await message.reactions.cache.get(this.starboardEmoji).users.fetch();
		if(users.get(client.user.id)) return;
		const embed = new Discord.MessageEmbed()
			.setAuthor({
				name: message.member?.displayName ?? message.author.username,
				iconURL: message.member?.avatarURL() ?? message.author.avatarURL(),
			})
			.setDescription(message.content)
			.setColor(16755763)
			.setURL(message.url)
			.addField('Оригинал', `[#${message.channel.name}](${message.url})`)
			.setTimestamp();
		let embeds = []
		if(message.attachments.size){
			embed.setImage(message.attachments.at(0).url).setURL('https://google.com/');
			for(let i = 1; (i < 4) && (i < message.attachments.size); i++) {
				embeds.push(new Discord.MessageEmbed().setImage(message.attachments.at(i).url).setURL('https://google.com/'))
			};
		} else {
			const img = message.content.match(/https?:\/\/((media)|(cdn))\.discordapp\.((net)|(com))\/\S+/igm)
			if(img){
				embed.setImage(img[0]).setURL('https://google.com/');
				if(!(img[0].endsWith('mp4') || img[0].endsWith('mov') || img[0].endsWith('webp')))
					embed.setDescription(message.content.replace(img[0], ''));
				for(let i = 1; i < 4 && i < img.length; i++) {
					embeds.push(new Discord.MessageEmbed().setImage(img[i]).setURL('https://google.com/'));
					if(!(img[i].endsWith('mp4') || img[i].endsWith('mov') || img[i].endsWith('webp'))){
						embed.setDescription(embed.description.replace(img[i], ''));
					}
				};

			}
		};
		embeds.unshift(embed);
		await this.starboardChannel.send({embeds: embeds});
		await message.react(this.starboardEmoji);

	},
};
