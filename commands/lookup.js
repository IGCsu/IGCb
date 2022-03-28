module.exports = {

	active : true,
	category : 'Утилиты',

	name : 'lookup',
	title : 'Информация по id',
	description : 'Выдаёт информацию о пользователе или приглашении по id',
	descriptionShort : 'Returns information about the user or invite by id',
	description_localizations : {'ru': 'Выдаёт информацию о пользователе или приглашении по id', 'uk': 'Відображає інформацію про користувача/запрошення по id'},

	slashOptions : [{
		name : 'id',
		description : 'User or invite ID',
		description_localizations : {'ru': 'ID юзера или приглашения', 'uk': 'ID користувача/запрошення'},
		type : 3,
		required : true
	}],

	init : function(){ return this; },


	dateText : {
		hours : ['час', 'часа', 'часов'],
		minutes : ['минуту', 'минуты', 'минут'],
		days : ['день', 'дня', 'дней'],
		month : ['месяц', 'месяца', 'месяцев'],
		year : ['год', 'года', 'лет']
	},

	/**
	 * Собирает всю инфу о пользователе, формирует эмбед и возвращает его
	 *
	 * @param {Number} id ID пользователя
	 */
	call : async function(id){
		const user = await client.users.fetch(id);
		const member = await guild.members.fetch(id);
		const embed = new Discord.MessageEmbed();

		const now = Date.now();

		let text = 'Бот: ' + (user.bot ? 'да' : 'нет');
		text += '\nАккаунт зарегистрирован: ' + this.getDateFromNow(now - user.createdTimestamp);
		text += '\nТочная дата: ' + user.createdAt.toUTCString();

		if(member){
			text += '\n\nПрисоединился к сообществу: ' + this.getDateFromNow(now - member.joinedTimestamp);
			text += '\nТочная дата: ' + member.joinedAt.toUTCString();
			if(member.nickname) text += '\nНик в сообществе: ' + member.nickname;
			embed.setColor(member.displayColor);
		}
		embed.setThumbnail(user.avatarURL({ dynamic : true }))
		embed.setTitle(user.tag)
		embed.setDescription(text);

		return embed;
	},

	/**
	 * Обработка слеш-команды
	 * @param {CommandInteraction} int Команда пользователя
	 */
	slash : async function(int){
		try{
			const id = int.options.get('id').value;
			const embed = await this.call(id.replace(/[^-_\w]/g, ' ').match(/[0-9]+/g)[0]);
			int.reply({ embeds : [embed] });
		}catch(e){
			int.reply({ content : reaction.emoji.error + ' ' + localize(int.locale, 'User not found'), ephemeral : true });
		}
	},


	/**
	* Получение разницы меж датами
	*
	* @param  Number difference Разница во времени
	* @return String
	*/
	getDateFromNow : function(difference){
		difference = difference / 1000;

		const minutes = Math.round( (difference/60) % 60 );
		const hours = Math.round( (difference/3600) % 24 );
		const days = Math.round(difference/86400);
		const month = +(days/30).toFixed(1);
		const year = +(days/365).toFixed(1);

		if(days == 0){
			if(hours > 0) return hours + ' ' + num2str(hours, this.dateText.hours) + ' назад';
			if(minutes > 0) return minutes + ' ' + num2str(minutes, this.dateText.minutes) + ' назад';
			return 'меньше минуты назад...';
		}

		let value = days + ' ' + num2str(days, this.dateText.days) + ' назад';

		if(year >= 1)
			return value + ' ~ ' + year + ' ' + num2str(year, this.dateText.year) + ' назад';
		if(month >= 1)
			return value + ' ~ ' + month + ' ' + num2str(month, this.dateText.month) + ' назад';

		return value;
	}
};
