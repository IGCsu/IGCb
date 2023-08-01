import { Logger } from './Logger.js';
import { HelpController } from '../mvc/controllers/HelpController.js';
import { ConfigController } from '../mvc/controllers/ConfigController.js';
import { Command } from './Command.ts';
import { PermissionsBitField } from 'discord.js';

export class CommandRepository {

	/**
	 * Список команд бота
	 * @type {Object.<string, Command>}
	 */
	static list = {

		help: Command.create('help', (s) => HelpController.command(s))
			.setDesc('Help title'),

		config: Command.create('config', (s) => ConfigController.command(s))
			.setPerm(PermissionsBitField.Flags.ManageGuild)
			.setDesc('Config title')
			.addOptions(ConfigController.getCommandOptions())

	};

	/**
	 * Возвращает команду по наименованию или ID команды
	 * @param {string} key
	 * @return {Command}
	 */
	static get (key) {
		return this.list[key];
	}

	/**
	 * Проверяет существование команды по наименованию или ID команды
	 * @param {string} key
	 * @return {boolean}
	 */
	static has (key) {
		return !!this.list[key];
	}

	/**
	 * Перебор команд с вызовом функции
	 * Если функция вернёт false - перебор будет прерван
	 * @param {(Command) => boolean} callback
	 */
	static each (callback) {
		for (const name in this.list) {
			if (callback(this.get(name)) === false) {
				break;
			}
		}
	}

	/**
	 * Регистрирует команды
	 * @param {Client} client
	 */
	static init (client) {
		for (const name in this.list) {
			client.application.commands
				.create(this.get(name).toDiscord())
				.then(command => {
					this.get(name).setApp(command);
					Logger.info('Command "' + name + '" registered');
				});
		}
	}

}