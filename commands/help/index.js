const fs = require('fs');
const slashOptions = require('./slashOptions.json');
const { title, description } = require('./about.json');
const applicationCommandOptionTypes = require('./applicationCommandOptionTypes.json');

module.exports = {

	active : true,
	category : 'Утилиты',

	name : 'help',
	title : title,
	description : description,
	slashOptions : slashOptions,

	applicationCommandOptionTypes : applicationCommandOptionTypes,


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
			const name = fileName[1].split('.')[0];
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
	 * Подсказки названия модулей
	 *
	 * @param {AutocompleteInteraction} int
	 */
	autocomplete : async function(int){
		const timeStart = process.hrtime();
		let choices = [];

		const command = int.options.getFocused();
		let finded = [];

		for(let cmd in commands){
			if(commands[cmd].name.indexOf(command) !== -1 || !command) finded.push(commands[cmd]);
		}

		finded.sort((a, b) => getStringSimilarityDiff(a.name, b.name, command));

		const lang = int.locale.split('-')[0];

		let maxLength = 0;

		for(let command of finded){
			if(command.name.length > maxLength) maxLength = command.name.length;
		}

		for(let command of finded){
			if(choices.length > 25) break;

			const name = truncate((command.name + ' '.repeat(maxLength - command.name.length + 1) +
				(command.description?.[lang] ?? command.title[lang])), 100);
			choices.push({ name: name, value: command.name });
		}

		try{
			await int.respond(choices);
		} catch(e){
			const timeEnd = process.hrtime(timeStart);
			const timePerf = (timeEnd[0]*1000) + (timeEnd[1] / 1000000);
			console.warn('Autocomplete Interaction Failed: ' + timePerf + 'ms' + '\n' + e)
		};
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

		if(!commands[name]) return false;

		const c = commands[name]; // command

		const status = c.active
			? reaction.emoji.success + ' Активен'
			: reaction.emoji.error + ' Не активен';

		let slash = 'Неприменимо';
		if(c.slash){
			slash = '`/' + name + '` - ' + (c.description ? (c.description[lang] ?? c.description.ru) : (c.title[lang] ?? c.title.ru));
			if(c.slashOptions) slash += this.getSlashOptions(c.slashOptions, 1, lang);
		}

		let contextUser = 'Неприменимо';
		if(c.contextUser){
			contextUser = '`#' + name + '` - ' + (c.description ? (c.description[lang] ?? c.description.ru) : (c.title[lang] ?? c.title.ru));
		}

		let embed = new Discord.MessageEmbed()
			.setTitle(c.title[lang] ?? c.title.ru)
			.setColor('BLURPLE')
			.setAuthor({ name : name })
			.addField('Статус', status)
			.addField('Слеш-команда', slash)
			.addField('Контекстная команда к пользователю', contextUser);

		if(this.texts[name]){
			let desc = this.texts[name][lang] ?? this.texts[name].ru;

			desc = desc.replace(/\${[a-zA-Z0-9]+}/gi, x => {
				const name = x.match(/\${([a-zA-Z0-9]+)}/)[1];
				return c[name] ?? '~~' + x + '~~';
			});

			embed.setDescription(desc);
		}

		return embed;

	},


	/**
	 * Возвращает опции слеш-команды
	 * @param  {Object} slashOptions Объект опций слеш-команды
	 * @param  {Number} i            Текущий отступ
	 * @param  {String} lang         Локализация юзера
	 * @return {Array}
	 */
	getSlashOptions : function(slashOptions, i, lang){
		let text = '';

		for(let name in slashOptions){

			const type = this.applicationCommandOptionTypes[slashOptions[name].type];

			text += '\n' + ('- '.repeat(i)) + '`' + name + '` - ';
			text += slashOptions[name].description[lang] ?? slashOptions[name].description.ru;
			text += ' *[' + type.code + ']*';
			if(slashOptions[name].required) text += ' *(Req*)';

			if(slashOptions[name].slashOptions){
				text += this.getSlashOptions(slashOptions[name].slashOptions, i + 1, lang);
			}

		}

		return text;

	},


	/**
	 * Обработка слеш-команды
	 * @param {CommandInteraction} int Команда пользователя
	 */
	slash : async function(int){
		const command = int.options.getString('command');
		const lang = int.locale.split('-')[0];

		const embed = command ? await this.command(lang, command) : await this.call(lang);

		if(embed == false){
			return await int.reply({ content : reaction.emoji.error + ' Модуль "' + command + '" не найден', ephemeral: true });
		}

		await int.reply({ embeds : [embed] });
	},


	/**
	 * Возвращает короткое описание команды
	 * @param  {Object} c    Объект команды
	 * @param  {Locale} lang Локализация пользователя
	 * @return {String}
	 */
	getCommand : (c, lang) => (reaction.emoji[ c.active ? 'black_circle' : 'error' ]) + ' `' + c.name + '` - ' + (c.title[lang] ?? c.title.ru),

};
