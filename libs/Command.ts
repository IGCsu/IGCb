import {
	ApplicationCommand,
	ApplicationCommandType,
	PermissionsBitField
} from 'discord.js';
import { Lang } from '../mvc/models/Lang.js';

export class Command {

	protected app: ApplicationCommand;

	/**
	 * Функция-слушатель ивента
	 * @function
	 */
	func;

	/**
	 * Наименование команды
	 * @type {string}
	 */
	name;

	/**
	 * Ключ описания команды
	 * @type {string}
	 */
	desc;

	/**
	 * Тип команды
	 * @see ApplicationCommandType.ChatInput
	 * @see ApplicationCommandType.User
	 * @see ApplicationCommandType.Message
	 * @type {number}
	 */
	type = ApplicationCommandType.ChatInput;

	/**
	 * Права, необходимые для доступа к команде
	 * @type {PermissionsBitField}
	 */
	perm;

	/**
	 * Опции команды
	 * @type {Object[]}
	 */
	options = [];

	/**
	 * @param {string} data.name
	 * @param {function} [data.func]
	 * @param {number} [data.type]
	 * @param {PermissionsBitField} [data.perm]
	 * @param {string} [data.desc]
	 * @param {Object[]} [data.options]
	 */
	constructor (data) {
		this.name = data.name;
		if (data.func) this.func = data.func;
		if (data.type) this.type = data.type;
		if (data.perm) this.perm = data.perm;
		if (data.desc) this.desc = data.desc;
		if (data.options) this.options = data.options;
	}

	/**
	 * Создаёт команду
	 * @param {string} name
	 * @param {function} [func]
	 * @param {number} [type]
	 * @return this
	 */
	static create (name, func, type) {
		return new this({
			name: name,
			func: func,
			type: type
		});
	}

	/**
	 * @param {function} func
	 * @return this
	 */
	setFunc (func) {
		this.func = func;
		return this;
	}

	/**
	 * @param {string} desc
	 * @return this
	 */
	setDesc (desc) {
		this.desc = desc;
		return this;
	}

	/**
	 * @param {ApplicationCommand} app
	 * @return this
	 */
	setApp (app) {
		this.app = app;
		return this;
	}

	/**
	 * @param {number} type
	 * @return this
	 */
	setType (type) {
		this.type = type;
		return this;
	}

	/**
	 * @param {PermissionsBitField} perm
	 * @return this
	 */
	setPerm (perm) {
		this.perm = perm;
		return this;
	}

	/**
	 * @param {Object} option
	 * @return this
	 */
	addOption (option) {
		this.options.push(option);
		return this;
	}

	/**
	 * @param {Object[]} options
	 * @return this
	 */
	addOptions (options) {
		for (const option of options) {
			this.addOption(option);
		}

		return this;
	}

	toDiscord () {
		let result = {
			name: this.name,
			type: this.type,
			options: this.options
		};

		result.description = Lang.getText(this.desc);

		if (!result.description) {
			throw new ReferenceError(
				'Missing description of command "' + this.name + '" in default language'
			);
		}

		result.descriptionLocalizations = Lang.toDiscord(this.desc);

		return result;
	}

	/**
	 * @param {string} [locale=Lang.DEFAULT_LANG]
	 * @return {string}
	 */
	toString (locale) {
		if (!locale) locale = Lang.DEFAULT_LANG;

		return '</' + this.name + ':' + this.app.id + '> - ' +
			Lang.getText(this.desc, locale);
	}

}