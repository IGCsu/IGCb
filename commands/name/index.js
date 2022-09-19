const SlashOptions = require('../../BaseClasses/SlashOptions');
const BaseCommand = require('../../BaseClasses/BaseCommand');
const LangSingle = require('../../BaseClasses/LangSingle');
const { CommandInteraction, GuildMember, } = require('discord.js')

const translit = require('transliteration');
const slashOptions = require('./slashOptions');
const { title } = require('./about.json');
const transliterateOptions = require('./transliterateOptions.json');

class Name extends BaseCommand {

	constructor(path) {
		super(path);

		this.category = 'Инструменты'
		this.name = 'name'
		this.title = new LangSingle(title);
		this.description = new LangSingle(title);
		this.slashOptions = slashOptions

		this.transliterateOptions = transliterateOptions

		return new Promise(async resolve => {
			client.on('guildMemberAdd', async member => await this.silent(member));
			client.on('userUpdate', async (oldUser, newUser) => {
				if(oldUser.username === newUser.username) return;
				const member = await guild.members.fetch({ user : newUser });
				if(member) await this.silent(member);
			});
			client.on('guildMemberUpdate', async (oldMember, newMember) => {
				if(oldMember.toName() === newMember.toName()) return;
				await this.silent(newMember);
			});
			resolve(this);
		});
	}


	/**
	 * Обработка
	 *
	 * @param {string} nickname Указанный никнейм
	 * @param {GuildMember} member Объект пользователя
	 * @return {Promise<Object>}
	 */
	async call(nickname, member){
		const fixed = this.fix(nickname, true);

		if(fixed.status === 'error')
			return { error : reaction.emoji.error + ' ' + fixed.text };

		try{
			const old = member.toName();
			await member.setNickname(fixed.name, 'По требованию ' + member.toName(true));
			let response = { success : reaction.emoji.success + ' Никнейм изменён `' + old + '` => `' + fixed.name + '`' };
			if(fixed.text.length) response.warning = reaction.emoji[fixed.status] + ' ' + fixed.text;
			return response;
		}catch(e){
			return { error : reaction.emoji.error + ' Упс... Ошибка'};
		}
	}


	/**
	 * Обработка слеш-команды
	 * @param {CommandInteraction} int Команда пользователя
	 */
	async slash(int){
		let response = await this.call(int.options.get('nick').value, int.member);

		if(response.error)
			return int.reply({ content : response.error, ephemeral : true });

		await int.reply({ content : response.success });

		if(response.warning)
			await int.followUp({
				content : response.warning,
				ephemeral : true
			});
	}


	/**
	 * Тихое обновление
	 * Обновление никнейма пользователя без его участия
	 *
	 * @param {GuildMember} member Объект пользователя
	 * @return {String}
	 */
	async silent(member){
		const name = member.toName();

		let fixed = this.fix(name);
		if(fixed.length > 30) fixed = fixed.substring(0, 30);
		if(!fixed.length) fixed = 'Rename me please';

		if(fixed === name) return { status : false };

		try{
			await member.setNickname(fixed, 'По требованию Устава Сообщества').then(() => {}, () => {});
			await member.send({content: "Ваш никнейм в сообществе IGC был изменён т.к. в нём присутствовали запрещённые символы"});
			return { status : true, fixed : fixed, name : name };
		}catch(e){
			console.warn(e);
		}
	}


	/**
	 * Исправление строки
	 *
	 * @param  {String}  nickname Никнейм для фикса
	 * @param  {Boolean} reason   Требуется ли указание результата
	 * @return {{name: string, text: string, status: string}}
	 */
	fix(nickname, reason){
		let name = translit.transliterate(nickname, this.transliterateOptions);
		name = name.replace(/`/gi, '\'');
		name = name.replace(/[^а-яёa-z0-9'\[\]\(\)_\-\.\s]/gi, '');
		name = name.replace(/\s+/gi, ' ');
		name = name.replace(/^[^а-яёa-z0-9\[\(]+/gi, '');
		name = name.trim();

		if(!reason) return name;

		let text = '';
		if(nickname !== name) text = 'Из ника удалены недопустимые символы. ';

		if(!name.length)
			return {
				text : text + 'Никнейм `' + name + '` - недопустим или пуст',
				status : 'error', name : name
			};

		if(name.length > 30)
			return {
				text : text + 'Никнейм недопустимой длины. Максимальная длина - 30 символов. Длина никнейма `' + name + '` - ' + name.length,
				status : 'error', name : name
			};

		if(name.length < 3)
			return {
				text : text + 'Никнейм недопустимой длины. Минимальная длина - 3 символа. Длина никнейма `' + name + '` - ' + name.length,
				status : 'error', name : name
			};

		if(name.length > 20)
			return {
				text : text + 'Никнейм превышает рекомендуемую длину. Рекомендуемая длинна - до 20 символов. Длина никнейма `' + name + '` - ' + name.length,
				status : 'warning', name : name
			};

		return { text : text, status : 'success', name : name };
	}

}

module.exports = Name;
