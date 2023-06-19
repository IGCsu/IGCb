const SlashOptions = require('../../BaseClasses/SlashOptions');
const BaseCommand = require('../../BaseClasses/BaseCommand');
const LangSingle = require('../../BaseClasses/LangSingle');
const { Message, MessageReaction } = require('discord.js');

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

	/**
	 *
	 * @param {MessageReaction} reaction
	 * @param {Message} message
	 * @return {Promise<void>}
	 */
	async call (reaction, message) {
		if (message.channel.nsfw) return;
		if (message.channel === this.starboardChannel) return;
		if (reaction.count !== this.defaultEmojiCount) return;

		const users = await message.reactions.cache.get(
			this.starboardEmoji
		).users.fetch();

		if (users.get(client.user.id)) return;

		if (message.reference?.messageId) {
			let reference = await message.channel.messages
				.fetch(message.reference.messageId);
			await this.createMessage(reference, true);
		}

		message.react(this.starboardEmoji)
			.then(react => {
				this.createMessage(react.message);
			})
			.catch(error => {
				message.reply(
					`Похоже <@${message.author.id}> добавил бота в чёрный список.\n` +
					`Отправка сообщения в <#${this.starboardChannel.id}> невозможна.`
				)
			});
	}

	/**
	 * Создаёт сообщение из под вебхука на основе другого
	 * @param {Message} message
	 * @param {Boolean} [reference]
	 * @return {Promise<Message>}
	 */
	async createMessage (message, reference) {
		const payload = {
			avatarURL: message.member?.avatarURL() ?? message.author.avatarURL(),
			username: message.member?.displayName ?? message.author.username,
			allowedMentions: constants.AM_NONE
		};

		if (message.content) payload.content = message.content;
		if (message.attachments) {
			let atts = [];
			message.attachments.forEach(att => atts.push(att.proxyURL ?? att.url));
			payload.files = atts;
		}
		if (message.embeds) payload.embeds = message.embeds;

		if (!reference) {
			payload.components = [
				{
					type: 1, components: [
						{
							type: 2,
							style: 5,
							url: message.url,
							label: 'Оригинал в #' + message.channel.name
						}
					]
				}
			];
		} else if (payload.content) {
			payload.content = '>>> ' + payload.content;
		}

		return await this.webhook.send(payload);
	}

}

module.exports = Starboard;
