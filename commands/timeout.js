const localize = require("../functions/localize");

module.exports = {

	active : true,
	category : 'Роли',

	name : 'timeout',
	title : {
		'ru':'Модуль мутов',
		'en':'Mut module',
		'uk':'Модуль мутів',
	},
	description : {
		'ru':'Мутит указанного пользователя на указанное время',
		'en':'Mutes the specified user for the specified time',
		'uk':'Мутить вказаного користувача на вказаний час',
	},

	slashOptions : [{
		name : 'user',
		name_localizations : {'ru': 'пользователь' , 'uk': 'користувач'},
		description : 'Community member whose alive role will be switched',
		description_localizations : {'ru': 'Участник Сообщества у которого будет переключена роль alive', 'uk': 'Користувач спільноти у якого буде змінюватися роль alive'},
		type : 6,
		required : true
	},
	{
		name : 'duration',
		name_localizations : {'ru': 'продолжительность' , 'uk': 'тривалість'},
		description : 'Timeout duartion. Time format: (1d6h30m5s)',
		description_localizations : {'ru': 'Продолжительность таймаута. Формат времени: (1d6h30m5s)', 'uk': 'Тривалість таймауту. Формат часу: (1d6h30m5s)'},
		type : 3,
		required : true
	},
	{
		name : 'reason',
		name_localizations : {'ru': 'причина' , 'uk': 'причина'},
		description : 'Reason for the timeout. It will be visible in the audit log and #некролог',
		description_localizations : {'ru': 'Причина таймаута. Будет видна в аудит логе и #некролог', 'uk': 'Причина таймауту. Буде видно в аудит лозі і #некролог'},
		type : 3,
		required : false
	}
	],


	init : function(path){
		return this;
	},


	/**
	 * Обработка команды
	 * Проверяет наличие прав и выдаёт таймаут
	 * @param {CommandInteraction|UserContextMenuInteraction} int    Команда пользователя
	 * @param {GuildMember|Number}                            member Объект или ID пользователя
	 * @param {String}                                        string Строка для парсинга врпемени
	 */
	call : async function(int, member, string, reason= ''){
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

		await int.reply({ embeds: [
			new Discord.MessageEmbed()
				.setTitle(reaction.emoji.success + ' ' + member.user.tag + ' Был замьючен | ' + reason)
				.setColor(2075752)
		]});
		await member.timeout(duration, reason);
	},


	/**
	 * Обработка слеш-команды
	 * @param {CommandInteraction} int Команда пользователя
	 */
	slash : async function(int){
		this.call(int, int.options.getMember('user'), int.options.getString('duration'), int.options.getString('reason') ?? '');
	},

	/**
	 * Проверка наличия роли Сенат или Привратник
	 *
	 * @param {GuildMember} member
	 */
	permission : member =>
		member.roles.cache.has('916999822693789718') ||
		member.roles.cache.has('613412133715312641') ||
		member.id == '500020124515041283'

};
