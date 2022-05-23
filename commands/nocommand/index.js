const fetch = require('node-fetch');
const { title } = require('./about.json');

module.exports = {

	active : true,
	category : 'Утилиты',

	name : 'nocommand',
	title : title,

	/**
	 * Получает json объект Устава Сообщества и помещает его в кэш
	 */
	init : async function(path){
		try{
			this.rules = await (await fetch('https://igc.su/rules?j=true')).json();
		} catch(e) {
			this.siteOffline = true;
			log.initText += log.error(path + ': Сайт недоступен');
		}
		return this;
	},

	/**
	 * Обработка сообщения, которое не является командой
	 * @param {Message} msg Сообщение пользователя
	 */
	call : async function(msg){
		await this.destroyBot(msg); // Прекращение работы бота при запуске дубликата
		if(commands.levels) commands.levels.monitoring(msg); // Опыт за сообщение
		if(!this.siteOffline) await this.rule(msg); // Проверка на упоминание пункта Устава
		await this.fixLink(msg); // Исправление нерабочей ссылки
		await this.nsfw(msg) // Преобразование nsfw-кода в ссылку
		await this.opinion(msg); // Прикрепление реакций в #предложения
		await this.event(msg); // Прикрепление реакций в #ивенты
		await this.elections(msg); // Прикрепление реакций в #выборы

		if(commands.phishing) commands.phishing.message(msg);
	},


	/**
	 * Проверка на упоминание пункта Устава
	 * @param {Message} msg Сообщение пользователя
	 */
	destroyBot : async function(msg){
		if(msg.channelId != 574997373219110922 || msg.author.id != client.user.id) return;
		if(msg.embeds[0]?.title != 'Бот запущен') return;

		await msg.reply({ content : 'Прекращена работа бота-дубликата у ' + (process.env.USERNAME ?? 'Host') })

		log.error('Прекращение работы бота: бот запущен в другом месте');

		return process.kill(process.pid);
	},


	/**
	 * Проверка на упоминание пункта Устава
	 * @param {Message} msg Сообщение пользователя
	 */
	rule : async function(msg){
		if(msg.content.length < 2) return;
		msg.content = msg.content.replace('а', 'a');
		msg.content = msg.content.replace(/^r\.?/, '');
		if(this.rules[msg.content])
			await msg.channel.send(
				{
					content : 'https://igc.su/rules?f=' + msg.content,
					messageReference: msg.reference?.messageId
				}
			);
	},

	/**
	 * Исправление нерабочей ссылки
	 * @param {Message} msg Сообщение пользователя
	 */
	fixLink : async function(msg){
		if(!/https?:\/\/media\.discordapp\.net\/\S+((\.webm)|(\.mp4))/i.test(msg.content)) return;

		await msg.delete();
		await msg.channel.send({
			content : `<@${msg.author.id}>: ` + msg.content.replace('media.discordapp.net', 'cdn.discordapp.com'),
			//allowedMentions : { parse : [] },
			reply : {messageReference: msg.reference?.messageId, failIfNotExists: false}
		});
	},

	/**
	 * Преобразование кода в ссылку
	 * @param {Message} msg Сообщение пользователя
	 */
	nsfw : async function(msg){
		if(msg.channel.id != 681790010550255617 || !/^[0-9]{2,}$/.test(msg.content)) return;

		await msg.delete();
		await msg.channel.send({
			content : `<@!${msg.author.id}>: https://nhentai.net/g/${msg.content}/`,
			allowedMentions : { parse : [] },
			reply : {messageReference: msg.reference?.messageId, failIfNotExists: false}
		});
	},

	/**
	 * Прикрепление реакций в #предложения
	 * @param {Message} msg Сообщение пользователя
	 */
	opinion : async function(msg){
		if(msg.channel.id != 500300930466709515 || msg.author.bot || (msg.flags & 64)) return;

		await msg.react(reaction.emoji.Sg3);
		await msg.react(reaction.emoji.Sg0);
	},

	/**
	 * Прикрепление реакций в #ивенты
	 * @param {Message} msg Сообщение пользователя
	 */
	event : async function(msg){
		if(msg.channel.id != 572472723624951839) return;

		const emojis = msg.content.match(/<:[^:]+:([0-9]+)>/gi);
		if(!emojis) return;
		emojis.forEach(async emoji => {
			emoji = msg.guild.emojis.cache.get(emoji.match(/<:[^:]+:([0-9]+)>/i)[1]);
			if(emoji) await msg.react(emoji);
		});
	},

	/**
	 * Прикрепление реакций в #выборы
	 * @param {Message} msg Сообщение пользователя
	 */
	elections : async function(msg){
		if(!((msg.channel.id == 612280548777525249) && msg.content.startsWith('<@') && msg.content.endsWith('>') && (msg.content.length < 26))) return;

		await msg.react(reaction.emoji.Sg3);
		await msg.react(reaction.emoji.Sg0);
	},

};
