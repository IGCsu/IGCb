const SlashOptions = require('../../BaseClasses/SlashOptions');
const BaseCommand = require('../../BaseClasses/BaseCommand');
const LangSingle = require('../../BaseClasses/LangSingle');

const { title } = require('./about.json');

class Starboard extends BaseCommand {

	constructor (path) {
		super(path);

		this.category = 'Развлечения';
		this.name = 'starboard';
		this.title = this.description = new LangSingle(title);

		this.starboardChannel = guild.channels.cache.get('938171284553101456');
		this.starboardEmoji = '⭐';
		this.defaultEmojiCount = 7;

		if (!this.starboardChannel) {
			log.initText += log.error(path + ': Starboard канал не найден');
			return this;
		}

		return new Promise(async resolve => {

			this.webhook = (await this.starboardChannel.fetchWebhooks()).filter(
				webhook => (
					webhook.name === this.name
					&& webhook.owner.id === client.user.id
				)
			).first()

			if (!this.webhook) {
				this.webhook = await this.starboardChannel.createWebhook(this.name, {
					reason: 'Из за отсутсвия в канале необходимого вебхука'
				})
			}

			client.on('raw', async (data) => {
				if (data.t !== 'MESSAGE_REACTION_ADD') return;
				const reaction = data.d;
				if (reaction.emoji.name !== this.starboardEmoji) return;
				const message = await ((await (client.channels.fetch(
					data.d.channel_id
				))).messages.fetch(data.d.message_id));
				await this.call(
					message.reactions.cache.get(reaction.emoji.name), message);
			});
			resolve(this);
		});
	}

	async call (reaction, message) {
		if (message.channel.nsfw) return;
		if (message.channel === this.starboardChannel) return;
		if (reaction.count < this.defaultEmojiCount) return;
		const users = await message.reactions.cache.get(
			this.starboardEmoji
		).users.fetch();
		if (users.get(client.user.id)) return;

		const atts = []
		message.attachments.forEach (att => { atts.push( att.proxyURL ) });

		const payload = {
			avatarURL: message.member?.avatarURL() ?? message.author.avatarURL(),
			username: message.member?.displayName ?? message.author.username,
			allowedMentions: constants.AM_NONE,
			components: [{ type: 1, components: [
				{
					type:2,
					style: 5,
					url: message.url,
					label: 'Перейти к оригиналу'
				}
				]}]
		};
		if(message.content)
			payload['content'] = message.content;
		if(message.attachments)
			payload['files'] = atts;
		if(message.embeds)
			payload['embeds'] = message.embeds;

		await message.react(this.starboardEmoji);
		await this.webhook.send(payload);

	}
}

module.exports = Starboard;
