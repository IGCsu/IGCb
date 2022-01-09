const translit = require('transliteration');

module.exports = {

	active : true,
	name : 'name',
	title : 'Обновление никнеймов',
	description : 'Используется для обновления никнейма',
	category : 'Никнейм',


	init : function(){
		client.on('guildMemberAdd', async member => await this.silent(member));
		client.on('userUpdate', async (oldUser, newUser) => {
			if(oldUser.username == newUser.username) return;
			const member = await guild.members.fetch({ user : newUser });
			if(member) await this.silent(member);
		});
		client.on('guildMemberUpdate', async (oldMember, newMember) => {
			if(member2name(oldMember) == member2name(newMember)) return;
			await this.silent(newMember);
		});

		return this;
	},


	options : {
		ignore : ['а', 'б', 'в', 'г', 'д', 'е', 'ё', 'ж', 'з', 'и', 'й', 'к', 'л',
			'м', 'н', 'о', 'п', 'р', 'с', 'т', 'у', 'ф', 'х', 'ц', 'ч', 'ш', 'щ', 'ь',
			'ы', 'ъ', 'э', 'ю', 'я', 'А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ё', 'Ж', 'З', 'И',
			'Й', 'К', 'Л', 'М', 'Н', 'О', 'П', 'Р', 'С', 'Т', 'У', 'Ф', 'Х', 'Ц', 'Ч',
			'Ш', 'Щ', 'Ь', 'Ы', 'Ъ', 'Э', 'Ю', 'Я', '-', '_', '\'', '`', '.', '[', ']',
			'(', ')']
	},


	/**
	 *
	 *
	 * @param {Message} curr_name   
	 * @param {Array}   member		Параметры команды
     * @param {Array}   author      Параметры команды
	 */
	call : async function(curr_name, member, author){
		const name = curr_name.join(' ');
		const fixed = this.fix(name);

		if(fixed.length > 30) return reaction.emojis.error + ' Никнейм недопустимой длины. Максимальная длина - 30 символов. Длина никнейма `' + fixed + '` - ' + fixed.length;

		if(fixed.length < 3) return reaction.emojis.error + ' Никнейм недопустимой длины. Минимальная длина - 3 символа. Длина никнейма `' + (fixed == 'Rename me please' ? name : fixed) + '` - ' + (fixed == 'Rename me please' ? name.length : fixed.length);

		if(name == fixed){
			if(fixed.length > 20)
				const warning = reaction.emojis.warning + ' Никнейм превышает рекомендуемую длину. Рекомендуемая длинна - до 20 символов. Длина никнейма `' + fixed + '` - ' + fixed.length;
			try{
				const old = member2name(member);
				await member.setNickname(name, 'По требованию ' + member2name(author, 1));
				return reaction.emojis.success + ' Никнейм изменён `' + old + '` => `' + name + '`', warning;
			}catch(e){
				return reaction.emojis.error + ' Упс... Ошибка';
			}
		}
	},

	slash : async function(int){
		response, warning = await this.call(int.options.get('nick'), int.member, int,member);
		await int.reply(response);
		if(warning) await int.followUp(warning);
	},


	/**
	 * Тихое обновление
	 * Обновление никнейма пользователя без его участия
	 *
	 * @param  {GuildMember} member
	 * @return {String}
	 */
	silent : async function(member){
		const name = member2name(member);

		let fixed = this.fix(name);
		if(fixed.length > 30) fixed = fixed.substring(0, 30);

		if(fixed == name) return { status : false };

		await member.setNickname(fixed, 'По требованию Устава Сообщества').then(() => {}, () => {});
		try{
			await member.send({content: "Ваш никнейм в сообществе IGC был изменён т.к. в нём присутствовали запрещённые символы"});
		} catch(e) {
			console.warn(e);
		};
		return { status : true, fixed : fixed, name : name };
	},


	/**
	 * Исправление строки
	 *
	 * @param  {String} name
	 * @return {String}
	 */
	fix : function(name){
		name = translit.transliterate(name, this.options);
		name = name.replace(/[^а-яёa-z0-9`'\[\]\(\)_\-\.\s]/gi, '');
		name = name.replace(/\s+/gi, ' ');
		name = name.replace(/^[^а-яёa-z0-9\[\(]+/gi, '');
		name = name.trim();
		if(!name.length) name = 'Rename me please';

		return name;
	}

};