const fetch = require('node-fetch');

module.exports = {

	active : true,
	category : 'Утилиты',

	name : 'nocommand',
	title : 'Реакции на сообщения',
	text : 'Модуль реагирования на сообщения. Отвечает за реакции в #ивенты, #предложения и тп. Отвечает за фишинг и обработку ссылок.',
	descriptionShort : 'Модуль реагирования на сообщения',

	/**
	 * Получает json объект Устава Сообщества и помещает его в кэш
	 */
	init : async function(){
		this.rules = await (await fetch('https://igc.su/rules?j=true')).json();

		return this;
	},

	/**
	 * Обработка сообщения, которое не является командой
	 * @param {Message} msg Сообщение пользователя
	 */
	call : async function(msg){
		await this.rule(msg); // Проверка на упоминание пункта Устава
		await this.fixLink(msg); // Исправление нерабочей ссылки
		await this.nsfw(msg) // Преобразование nsfw-кода в ссылку
		await this.opinion(msg); // Прикрепление реакций в #предложения
		await this.event(msg); // Прикрепление реакций в #ивенты
		await this.elections(msg);	// Прикрепление реакций в #выборы

		if(commands.list.phishing) commands.list.phishing.message(msg);
	},


	/**
	 * Проверка на упоминание пункта Устава
	 * @param {Message} msg Сообщение пользователя
	 */
	rule : async function(msg){
		if(this.rules[msg.content])
			await msg.channel.send({ content : 'https://igc.su/rules?f=' + msg.content });
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
			reply : {messageReference: msg.reference?.messageId ?? undefined, failIfNotExists: false}
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
			reply : {messageReference: msg.reference?.messageId ?? undefined, failIfNotExists: false}
		});
	},

	/**
	 * Прикрепление реакций в #предложения
	 * @param {Message} msg Сообщение пользователя
	 */
	opinion : async function(msg){
		if(msg.channel.id != 500300930466709515) return;

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
		if(msg.channel.id != 612280548777525249 || !msg.content.startsWith('<@') & !msg.content.endsWith('>') && msg.content.length >= 26) return;

		await msg.react(reaction.emoji.Sg3);
		await msg.react(reaction.emoji.Sg0);
	},

};
