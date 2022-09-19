const SlashOptions = require('../../BaseClasses/SlashOptions');
const BaseCommand = require('../../BaseClasses/BaseCommand');
const LangSingle = require('../../BaseClasses/LangSingle');
const { GuildMember, AutocompleteInteraction, CommandInteraction, UserContextMenuInteraction, InteractionReplyOptions} = require('discord.js')

const slashOptions = require('./slashOptions');
const { title, description } = require('./about.json');
const fetch = require("node-fetch");

class Timeout extends BaseCommand{

	constructor(path) {
		super(path);

		this.category = 'Модерация'

		this.name = 'timeout'
		this.title = new LangSingle(title);
		this.description = new LangSingle(description);
		this.slashOptions = slashOptions

		return new Promise(async resolve => {
			this.rulesCache = {};
			try{
				this.rules = await (await fetch(constants.SITE_LINK + '/rules?j=true')).json();
				for(let rule in this.rules){
					if(!rule.startsWith('a'))
						this.rulesCache[rule] = this.rules[rule];
				}
			}catch(e){
				log.initText += log.warn(path + ': Site offline: Off generate suggestions');
			}
			resolve(this);
		});
	}


	/**
	 * Обработка команды
	 * Проверяет наличие прав и выдаёт таймаут
	 * @param {CommandInteraction|UserContextMenuInteraction} int    Команда пользователя
	 * @param {GuildMember|Number}                            member Объект или ID пользователя
	 * @param {String}                                        string Строка для парсинга врпемени
	 * @param {String}                                        reason Причина
	 * @return {InteractionReplyOptions}
	 */
	async call(int, member, string, reason){
		if(!this.permission(int.member))
			return {
				content : reaction.emoji.error + ' ' + int.str('You do not have enough rights to change the roles of other users'),
				ephemeral : true
			};

		let duration = 1;
		try{
			const time = /^(?:(?<days>[1-9]\d*)d(?:\s(?!$))?)?(?:(?<hours>2[0-3]|1\d|[1-9])h(?:\s(?!$))?)?(?:(?<minutes>[1-5]\d|[1-9])m(?:\s(?!$))?)?(?:(?<seconds>[1-5]\d|[1-9])s)?$/gm.exec(string);
			duration = ((time.groups.days ?? 0) * 86400000) + ((time.groups.hours ?? 0) * 3600000) + ((time.groups.minutes ?? 0) * 60000) + (time.groups.seconds ?? 0) * 1000;
		} catch(e) {
			console.log(e);
			return { content : int.str('Invalid duration provided'), ephemeral : true};
		}
		if(!duration || Math.floor(duration / 86400000) > 28) return { content : int.str('Invalid duration provided'), ephemeral : true};
		await member.timeout(duration, reason);
		return { embeds: [
			new Discord.MessageEmbed()
				.setTitle(reaction.emoji.success + ' ' + member.user.tag + ' Был замьючен | ' + reason)
				.setColor(2075752)
		]};
		
	}


	/**
	 * Обработка слеш-команды
	 * @param {CommandInteraction} int Команда пользователя
	 */
	async slash(int){
		let msg = '';
		if (int.options.getString('reason') === 'SITE_OFFLINE')
			msg = { contnet: 'Этот вариант не предусмотрен для выбора как причина мута, а всего лишь информирует о том, что бот не смог получить список всех правил.\nВпредь пожалуйста больше не выбирайте данный пункт', ephemeral: true }
		if (msg === '')
			msg = await this.call(int, int.options.getMember('user'), int.options.getString('duration'), int.options.getString('reason') ?? '');
		
		await int.reply(msg);
	}


	/**
	 * 
	 * @param {AutocompleteInteraction} int 
	 */
	async autocomplete(int){
		const rawReason = int.options.getFocused();
		if(!rawReason) return
		let choices = [{ name: rawReason, value: rawReason }];
		if(!this.rulesCache){
			choices.push({ name: int.str('Failed to generate suggestions'), value:'SITE_OFFLINE' })
			return await int.respond(choices);
		}
		let ruleReasons = [];

		let subReason = rawReason.split(', ').at(-1);

		const fullKeyMatch = this.rulesCache[subReason] ? subReason : undefined;
		const partialKeyMatches = Object.keys(this.rulesCache).filter(key => key.includes(subReason));
		const partialValueMatchesKeys = Object.keys(this.rulesCache).filter(key => this.rulesCache[key].toLowerCase().includes(subReason.toLowerCase()));
		if(fullKeyMatch)
			ruleReasons.push(fullKeyMatch);
		if(partialKeyMatches)
			ruleReasons = ruleReasons.concat(partialKeyMatches);
		if(partialValueMatchesKeys)
			ruleReasons = ruleReasons.concat(partialValueMatchesKeys);


		const reasons = new Set(ruleReasons);
		for(let reason of reasons){
			choices.push({ name: reason + ': ' + this.rulesCache[reason], value: rawReason })
		}
		return await int.respond(choices);
	}

	/**
	 * Проверка наличия роли Сенат или Привратник
	 *
	 * @param {GuildMember} member
	 */
	permission(member) {
		return member.roles.cache.has('916999822693789718') ||
		member.roles.cache.has('613412133715312641') ||
		member.id === '500020124515041283'
	}
}

module.exports = Timeout;
