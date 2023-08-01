const SlashOptions = require('../../BaseClasses/SlashOptions.js');
const AutocompleteChoices = require('../../BaseClasses/AutocompleteChoices.js');
const BaseCommand = require('../../BaseClasses/BaseCommand.js');
const LangSingle = require('../../BaseClasses/LangSingle.js');
const {
	AutocompleteInteraction,
	CommandInteraction,
	InteractionReplyOptions,
	GuildMember
} = require('discord.js');

const fs = require('fs');

const slashOptions = require('./slashOptions.js');
const { title, description } = require('./about.json');
const optionTypes = require('./optionTypes.json');

class Help extends BaseCommand {

	/**
	 * Список описаний для комманд
	 * @type {Object}
	 */
	texts = {};

	optionTypes = optionTypes;

	constructor (path) {
		super(path);

		this.category = 'Информация';
		this.name = 'help';
		this.title = new LangSingle(title);
		this.description = new LangSingle(description);
		this.slashOptions = slashOptions;

		const files = fs.readdirSync('./helpTexts/');
		for (const file of files) {
			const timeStart = process.hrtime();

			const fileName = file.split('_');
			const name = fileName[1].split('.')[0];
			const locale = fileName[0];

			if (!this.texts.hasOwnProperty(name)) this.texts[name] = {};
			this.texts[name][locale] = fs.readFileSync(
				'./helpTexts/' + file
			).toString();

			const timeEnd = process.hrtime(timeStart);
			const timePerf = (timeEnd[0] * 1000) + (timeEnd[1] / 1000000);

			log.initText += log.load(path + ' - ' + file, timePerf, true);
		}

		return new Promise(async resolve => {
			resolve(this);
		});
	}


	/**
	 * Подсказки названия модулей
	 *
	 * @param {AutocompleteInteraction} int
	 */
	async autocomplete (int) {
		const timeStart = process.hrtime();


		const perm = this.permission(int.member);

		const command = int.options.getFocused();
		let choices = new AutocompleteChoices();


		for(let name in commands){
			if(commands[name].category === 'nsfw' && !perm) continue;
			if(command && name.indexOf(command) === -1) continue;
			choices.push({name: name, value: name.toLowerCase()});
		}

		try{
			await int.respond(choices.sort(command));
		} catch(e){

			const timeEnd = process.hrtime(timeStart);
			const timePerf = (timeEnd[0] * 1000) + (timeEnd[1] / 1000000);
			console.warn(
				'Autocomplete Interaction Failed: ' + timePerf + 'ms' + '\n' + e
			);
		}
	}


	/**
	 * Генерирует эмбед со списком команд
	 * @param  {string} lang Локализация пользователя
	 * @return {InteractionReplyOptions}
	 */
	async call (lang) {

		let help = {};

		for (let c in commands) {
			const category = commands[c].category
				? commands[c].category
				: 'Остальные';
			if (commands[c].category === 'nsfw') continue;

			if (!help.hasOwnProperty(category)) help[category] = [];
			help[category].push(this.getCommand(commands[c], lang));
		}

		let embed = new Discord.MessageEmbed()
			.setTitle('Модули бота')
			.setColor('BLURPLE');

		for (let c in help) {
			embed.addField(c, help[c].sort().join('\n'));
		}

		return { embeds: [embed] };

	}


	/**
	 * Возвращает эмбед с информацией о команде
	 * @param {CommandInteraction} int Команда пользователя
	 * @param {string} lang Локализация пользователя
	 * @param {String} name Название команды
	 * @return {InteractionReplyOptions}
	 */
	async command (int, lang, name) {

		if (!commands[name]) return 404;

		const c = commands[name]; // command

		if (c.category === 'nsfw' && !this.permission(int.member)) return 403;

		const status = c.active
			? reaction.emoji.success + ' Активен'
			: reaction.emoji.error + ' Не активен';

		const DEFAULT_FUNC = constants.DEFAULT_FUNC.getSource();

		let slash = 'Неприменимо';
		if (c.slash.getSource() !== DEFAULT_FUNC) {
			slash = '`/' + name + '` - ' + c.description.get(lang);
			if (c.slashOptions) {
				slash += this.getSlashOptions(c.slashOptions, 1, lang);
			}
		}

		let contextUser = 'Неприменимо';
		if (c.contextUser.getSource() !== DEFAULT_FUNC) {
			contextUser = '`#' + name + '` - ' + c.description.get(lang);
		}

		let embed = new Discord.MessageEmbed()
			.setTitle(c.title.get(lang))
			.setColor('BLURPLE')
			.setAuthor({ name: name })
			.addField('Статус', status)
			.addField('Слеш-команда', slash)
			.addField('Контекстная команда к пользователю', contextUser);

		if (this.texts[name]) {
			let desc = this.texts[name][lang] ?? this.texts[name].ru;

			desc = desc.replace(/\${[a-zA-Z0-9]+}/gi, x => {
				const name = x.match(/\${([a-zA-Z0-9]+)}/)[1];
				return c[name] ?? '~~' + x + '~~';
			});

			embed.setDescription(desc);
		}

		return {
			embeds: [embed],
			ephemeral: c.category === 'nsfw'
		};

	}


	/**
	 * Возвращает опции слеш-команды
	 * @param {SlashOptions} slashOptions Объект опций слеш-команды
	 * @param {number} i Текущий отступ
	 * @param {string} lang Локализация юзера
	 * @return {string}
	 */
	getSlashOptions (slashOptions, i, lang) {
		let text = '';

		for (let name in slashOptions.list) {

			const type = this.optionTypes[slashOptions.list[name].type];

			text += '\n' + ('- '.repeat(i)) + '`' + name + '` - ';
			text += slashOptions.list[name].description.get(lang);
			text += ' *[' + type.code + ']*';
			if (slashOptions.list[name].required) text += ' *(Req*)';

			if (slashOptions.list[name].slashOptions) {
				text += this.getSlashOptions(
					slashOptions.list[name].slashOptions,
					i + 1,
					lang
				);
			}

		}

		return text;

	}


	/**
	 * Обработка слеш-команды
	 * @param {CommandInteraction} int Команда пользователя
	 */
	async slash (int) {
		const command = int.options.getString('command');
		const lang = int.locale.split('-')[0];

		const options = command
			? await this.command(int, lang, command)
			: await this.call(lang);

		if (typeof options == 'number') {
			let content = reaction.emoji.error + ' Неизвестная ошибка';
			if (options === 404) {
				content = reaction.emoji.error + ' Модуль "' + command + '" не найден';
			}
			if (options === 403) {
				content = reaction.emoji.error + ' Модуль "' + command +
					'" не доступен';
			}
			return int.reply({ content: content, ephemeral: true });
		}

		await int.reply(options);
	}


	/**
	 * Возвращает короткое описание команды
	 * @param  {Object} c    Объект команды
	 * @param  {Locale} lang Локализация пользователя
	 * @return {String}
	 */
	getCommand (c, lang) {
		return reaction.emoji[c.active ? 'black_circle' : 'error'] + ' `' +
			c.name + '` - ' + c.title.get(lang);
	}


	/**
	 * Проверка наличия роли Пониёб
	 * @param {GuildMember} member
	 */
	permission (member) {
		return member.roles.cache.has('682317950568628398');
	}

}

module.exports = Help;
