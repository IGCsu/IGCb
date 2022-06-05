const fs = require('fs');
const slashOptions = require('./slashOptions.json');
const { title, description } = require('./about.json');
const applicationCommandOptionTypes = require('./applicationCommandOptionTypes.json');

module.exports = {

	active : true,
	category : 'Информация',

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

		const perm = this.permission(int.member);

		const command = int.options.getFocused();
		let finded = [];

		for(let name in commands){
			if(commands[name].category == 'nsfw' && !perm) continue;
			if(command && name.indexOf(command) === -1) continue;

			finded.push(commands[name]);
		}

		finded.sort((a, b) => getStringSimilarityDiff(a.name, b.name, command));

		const lang = int.locale.split('-')[0];

		let maxLength = 0;

		for(let command of finded){
			if(command.name.length > maxLength) maxLength = command.name.length;
		}

		for(let command of finded){
			if(choices.length > 25) break;

			choices.push({ name: command.name, value: command.name });
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
	 * @param  {Locale}                  lang Локализация пользователя
	 * @return {InteractionReplyOptions}
	 */
	call : async function(lang){

		let help = {};

		for(let c in commands){
			const category = commands[c].category ? commands[c].category : 'Остальные';
			if(commands[c].category == 'nsfw') continue;

			if(!help.hasOwnProperty(category)) help[category] = [];
			help[category].push( this.getCommand(commands[c], lang) );
		}

		let embed = new Discord.MessageEmbed()
			.setTitle('Модули бота')
			.setColor('BLURPLE');

		for(let c in help){
			embed.addField(c, help[c].sort().join('\n'));
		}

		return { embeds: [embed] };

	},


	/**
	 * Возвращает эмбед с информацией о команде
	 * @param  {CommandInteraction}      int  Команда пользователя
	 * @param  {Locale}                  lang Локализация пользователя
	 * @param  {String}                  name Название команды
	 * @return {InteractionReplyOptions}
	 */
	command : async function(int, lang, name){

		if(!commands[name]) return 404;

		const c = commands[name]; // command

		if(c.category == 'nsfw' && !this.permission(int.member)) return 403;

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

		return {
			embeds: [embed],
			ephemeral: c.category == 'nsfw'
		};

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

		const options = command ? await this.command(int, lang, command) : await this.call(lang);

		if(typeof options == 'number'){
			let content = reaction.emoji.error + ' Неизвестная ошибка';
			if(options == 404) content = reaction.emoji.error + ' Модуль "' + command + '" не найден';
			if(options == 403) content = reaction.emoji.error + ' Модуль "' + command + '" не доступен';
			return await int.reply({
				content: content,
				ephemeral: true
			});
		}

		await int.reply(options);
	},


	/**
	 * Возвращает короткое описание команды
	 * @param  {Object} c    Объект команды
	 * @param  {Locale} lang Локализация пользователя
	 * @return {String}
	 */
	getCommand : (c, lang) => (reaction.emoji[ c.active ? 'black_circle' : 'error' ]) + ' `' + c.name + '` - ' + (c.title[lang] ?? c.title.ru),



	/**
	 * Проверка наличия роли Пониёб
	 *
	 * @param {GuildMember} member
	 */
	permission : member => member.roles.cache.has('682317950568628398')

};
