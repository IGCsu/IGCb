const slashOptions = require('./slashOptions.json');
const { title, description } = require('./about.json');
const { commands } = require('../handler');
const fetch = require("node-fetch");

module.exports = {

	active : true,
	category : 'Модерация',

	name : 'timeout',
	title : title,
	description : description,
	slashOptions : slashOptions,


	init : async function(path){
		this.rulesCache = {};
		try{
			this.rules = await (await fetch(constants.SITE_LINK + '/rules?j=true')).json();
			for(let rule in this.rules){
				if(!rule.startsWith('a'))
					this.rulesCache[rule] = this.rules[rule];
			}
		}catch(e){
			this.active = false;
		}

		return this;
	},


	/**
	 * Обработка команды
	 * Проверяет наличие прав и выдаёт таймаут
	 * @param {CommandInteraction|UserContextMenuInteraction} int    Команда пользователя
	 * @param {GuildMember|Number}                            member Объект или ID пользователя
	 * @param {String}                                        string Строка для парсинга врпемени
	 * @param {String}                                        reason Причина
	 */
	call : async function(int, member, string, reason){
		if(!this.permission(int.member))
			return int.reply({
				content : reaction.emoji.error + ' ' + localize(int.locale, 'You do not have enough rights to change the roles of other users'),
				ephemeral : true
			});

		let duration = 1;
		try{
			const time = /^(?:(?<days>[1-9]\d*)d(?:\s(?!$))?)?(?:(?<hours>2[0-3]|1\d|[1-9])h(?:\s(?!$))?)?(?:(?<minutes>[1-5]\d|[1-9])m(?:\s(?!$))?)?(?:(?<seconds>[1-5]\d|[1-9])s)?$/gm.exec(string);
			duration = ((time.groups.days ?? 0) * 86400000) + ((time.groups.hours ?? 0) * 3600000) + ((time.groups.minutes ?? 0) * 60000) + (time.groups.seconds ?? 0) * 1000;
		} catch(e) {
			console.log(e);
			return int.reply({ content : localize(int.locale, 'Invalid duration provided'), ephemeral : true});
		}
		if(!duration || Math.floor(duration / 86400000) > 28) return int.reply({ content : localize(int.locale, 'Invalid duration provided'), ephemeral : true});
		await member.timeout(duration, reason);
		return { embeds: [
			new Discord.MessageEmbed()
				.setTitle(reaction.emoji.success + ' ' + member.user.tag + ' Был замьючен')
				.setColor(2075752)
		]};
		
	},


	/**
	 * Обработка слеш-команды
	 * @param {CommandInteraction} int Команда пользователя
	 */
	slash : async function(int){
		msg = '';
		if (int.options.getString('reason') === 'SITE_OFFLINE')
			msg = { contnet: 'Этот вариант не предусмотрен для выбора как причина мута, а всего лишь информирует о том, что бот не смог получить список всех правил.\nВпредь пожалуйста больше не выбирайте данный пункт', ephemeral: true }
		if (msg === '')
			msg = await this.call(int, int.options.getMember('user'), int.options.getString('duration'), int.options.getString('reason') ?? '');
		
		await int.reply(msg);
	},


	/**
	 * 
	 * @param {AutocompleteInteraction} int 
	 */
	autocomplete : async function(int){
		const rawReason = int.options.getFocused();
		let choises = [{ name: rawReason, value: rawReason }];
		if(!this.rulesCache){
			choises.push({name:'Неудалось сгенерировать подсказки', value:'SITE_OFFLINE'})
			return await int.respond(choises);
		}
		let ruleReasons = [];
		for(let subReason of rawReason.split(', ')){
			const fullKeyMatch = this.rulesCache[subReason];
			const partialKeyMatches = this.rulesCache.keys().filter(key => key.includes(subReason));
			const partialValueMatchesKeys = this.rulesCache.keys().filter(key => this.rulesCache[key].includes(subReason));
			if(fullKeyMatch)
				ruleReasons.push(fullKeyMatch);
			if(partialKeyMatches)
				ruleReasons.concat(partialKeyMatches);
			if(partialValueMatchesKeys)
				ruleReasons.concat(partialValueMatchesKeys);
		}

		const reasons = new Set(ruleReasons);
		for(let reason of reasons){
			choises.push({ name: reason + ': ' + ruleReasons[reason], value: reason })
		}
	},

	/**
	 * Проверка наличия роли Сенат или Привратник
	 *
	 * @param {GuildMember} member
	 */
	permission : member =>
		member.roles.cache.has('916999822693789718') ||
		member.roles.cache.has('613412133715312641') ||
		member.id === '500020124515041283'

};
