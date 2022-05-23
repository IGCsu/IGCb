const fs = require('fs');
const { title, description } = require('./about.json');

module.exports = {

	active : true,
	category : 'Утилиты',

	name : 'help',
	title : title,
	description : description,


	/**
	 * Список описаний для комманд
	 * @type {Object}
	 */
	texts : {},


	init : async function(path){

		const files = await fs.readdirSync('./helpTexts/');
		for(const file of files){
			const timeStart = process.hrtime();

			const fileName = file.split('_');
			const name = fileName[1].split('.');
			const locale = fileName[0];

			if(!this.texts.hasOwnProperty(name)) this.texts[name] = {};
			this.texts[name][locale] = fs.readFileSync('./helpTexts/' + file).toString();

			const timeEnd = process.hrtime(timeStart);
			const timePerf = (timeEnd[0]*1000) + (timeEnd[1] / 1000000);

			log.initText += log.load(path + ' - ' + file, timePerf, true);
		}

		return this;
	},


	/**
	 * Генерирует эмбед со списком команд
	 *
	 * @param  {Locale}       lang Локализация пользователя
	 * @return {MessageEmbed}
	 */
	call : async function(lang){

		let help = {};

		for(let c in commands){
			const category = commands[c].category ? commands[c].category : 'Остальные'

			if(!help.hasOwnProperty(category)) help[category] = [];
			help[category].push( this.getCommand(commands[c], lang) );
		}

		let embed = new Discord.MessageEmbed()
			.setTitle('Модули бота')
			.setColor('BLURPLE');

		for(let c in help){
			embed.addField(c, help[c].sort().join('\n'));
		}

		return embed;

	},


	/**
	 * Возвращает эмбед с информацией о команде
	 * @param  {Locale}       lang Локализация пользователя
	 * @param  {String}       name Название команды
	 * @return {MessageEmbed}
	 */
	command : async function(lang, name){

		if(!commands[name]) return;

		const c = commands[name]; // command

		const status = c.active
			? reaction.emoji.success + ' Активен'
			: reaction.emoji.error + ' Не активен';

		let slash = 'Недоступно';
		if(c.slash){
			slash = '`/' + name + '` - ' + (c.description ? (c.description[lang] ?? c.description.ru) : (c.title[lang] ?? c.title.ru));

		}

		let embed = new Discord.MessageEmbed()
			.setTitle(c.title)
			.setColor('BLURPLE')
			.setAuthor({ name : name })
			.addField('Статус', status);

	},


	/**
	 * Обработка слеш-команды
	 * @param {CommandInteraction} int Команда пользователя
	 */
	slash : async function(int){
		const command = int.options.getString('command');
		const lang = int.locale.split('-')[0];

		const embed = command ? await this.command(lang, command) : await this.call(lang);

		await int.reply({ embeds : [embed], fetchReply: true });
	},


	/**
	 * Возвращает короткое описание команды
	 * @param  {Object} c    Объект команды
	 * @param  {Locale} lang Локализация пользователя
	 * @return {String}
	 */
	getCommand : (c, lang) => (reaction.emoji[ c.active ? 'success' : 'error' ]) + ' `' + c.name + '` - ' + (c.title[lang] ?? c.title.ru),

};
