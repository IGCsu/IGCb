const localize = require("../functions/localize");

module.exports = {

	active : true,
	category : 'Утилиты',

	name : 'help',
	title : 'Помощь по командам',
	description : 'Показывает список доступных команд или описание указанной команды',
	descriptionShort : 'Shows a list of available commands or a description of the specified command',
	description_localizations : {'ru': 'Показывает список доступных команд или описание указанной команды', 'uk': 'Показувати список доступних команд або опис зазначеної команди'},


	init : function(){ return this; },

	slashOptions: [
		{
			type: 3,
			required: false,
			name: 'category',
			name_localization: {ru: 'категория', uk: 'категорія'},
			description: 'Additional information',
			description_localization: {ru: 'Дополнительная информация', uk: 'Додаткова інформація'},
			choices: [
				{ name: 'О Activities', value: 'activities' },
				{ name: 'О Игровых ролях', value: 'roles' },
				{ name: 'Об Опросах', value: 'polls' },
				{ name: 'О Голосовых каналах', value: 'voices' },
			]
		}
	],

	/**
	 * Обработка команды
	 * В зависимости от указанных параметров, отправляет либо описание указанной команды, либо список команд
	 *
	 * @param {Message|CommandInteraction} msg
	 * @param {String}                     command Команда
	 */
	call : async function(msg, command){
		return command ? this.command(command) : this.cache;
	},

	/**
	 * Обработка слеш-команды
	 * @param {CommandInteraction} int Команда пользователя
	 */
	slash : async function(int){
		const embed = await this.call(int);
		const category = int.options.getString('category');
		if(!category)
			return await int.reply({ embeds : [embed], fetchReply: true });
		return await int.reply({content: localize(int.locale, 'In development'), ephemeral: true})
	},

	/**
	 * Обработка традиционной команды
	 * @param {Message} msg Сообщение пользователя
	 */
	message : async function(msg, params){
		const embed = await this.call(msg, params[0]);
		await msg.channel.send({ embeds : [embed] });
	},


	/**
	 * Генерирование и кэширование списка команд
	 *
	 * @param  {Object} list Список команд
	 * @return {Embed}
	 */
	generate : function(list){
		let help = {};

		for(let c in list){
			if(typeof list[c] === 'string') continue;

			const category = list[c].category ? list[c].category : 'Остальные'

			if(!help.hasOwnProperty(category)) help[category] = [];
			help[category].push( this.getCommand(list[c]) );
		}

		this.cache = new Discord.MessageEmbed()
			.setTitle('Модули бота')
			.setColor('BLURPLE');

		for(let c in help){
			const command = help[c];
			this.cache.addField(c, help[c].sort().join('\n'));
		}

	},


	getCommand : c => {
		return '`' + c.name + '` - ' + c.title + (c.description_localization?.ru ? (', *' + c.description_localization?.ru + '*') : '');
	}

};
