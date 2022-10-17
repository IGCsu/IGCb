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
			).first();

			if (!this.webhook) {
				this.webhook = await this.starboardChannel.createWebhook(this.name, {
					reason: 'Из за отсутсвия в канале необходимого вебхука'
				});
			}

			client.on('raw', async data => {
				if (data.t !== 'MESSAGE_REACTION_ADD') return;
				if (data.d.emoji.name !== this.starboardEmoji) return;

				const message = await ((await (client.channels.fetch(
					data.d.channel_id
				))).messages.fetch(data.d.message_id));

				await this.call(
					message.reactions.cache.get(data.d.emoji.name),
					message
				);
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

		let replyMessage;

		if (message.reference?.messageId) {
			replyMessage = await message.channel.messages
				.fetch(message.reference.messageId);
			replyMessage = await this.createMessage(replyMessage);
		}

		await this.createMessage(replyMessage, true, replyMessage);

		await message.react(this.starboardEmoji);
	}

	/**
	 * Создаёт сообщение из под вебхука на основе другого
	 * @param {Message} original
	 * @param {Boolean} [button=false]
	 * @param {Message} [reply]
	 * @return {Promise<Message>}
	 */
	async createMessage (original, button, reply) {
		let atts = [];
		original.attachments.forEach(att => atts.push(att.proxyURL));

		const payload = {
			avatarURL: original.member?.avatarURL() ?? original.author.avatarURL(),
			username: original.member?.displayName ?? original.author.username,
			allowedMentions: constants.AM_NONE
		};

		if (original.content) payload.content = original.content;
		if (original.attachments) payload.files = atts;
		if (original.embeds) payload.embeds = original.embeds;

		// Как неожиданно выяснилось, вебхук не может сделать ответ. Грустно.
		// if (reply) {
		// 	payload.reply = {
		// 		messageReference: reply,
		// 		failIfNotExists: false
		// 	};
		// }

		if (button) {
			payload.components = [
				{
					type: 1, components: [
						{
							type: 2,
							style: 5,
							url: original.url,
							label: 'Перейти к оригиналу'
						}
					]
				}
			];
		}

		return await this.webhook.send(payload);
	}

}

module.exports = Starboard;
