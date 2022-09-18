/**
 * Класс опций слеш комманд
 *
 * Структура опций основана на требуемой в документации API discord, однако содержит небольшие изменения:
 * * Объект не должен содержать "name" - оно содержится в ключе объекта.
 * * Объект не должен содержать "name_localizations" - локализация названий недопустима.
 * * Изменён "description". Он содержит стандартный объект локализации.
 *   Заменяет стандартный "description" и "description_localizations".
 * * Изменён "choices". Он содержит объект вариантов.
 *   В качестве ключа - значение варианта.
 *   В качестве значение объект локализации с названиями значения.
 * * Изменён "options". Вместо него необходимо использовать "slashOptions".
 *   Работает точно так же, как и родительский "slashOptions".
 * https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-structure
 */
class SlashOptions {

	/** @type {Object.<string, SlashOption>} */
	#list;

	get list(){
		return this.#list;
	}

	/**
	 * @param {Object.<string, SlashOption>} options
	 * @constructor
	 */
	constructor(options){
		for(const name in options){
			if(typeof name != 'string' || name.toLowerCase().replace(/[^A-Z0-3_-]/) !== name)
				throw new TypeError('No valid slash option name: ' + name);

			if(name.length > 32)
				throw new RangeError(
					'The slash option name "' + name + '" exceeds the allowed length: ' + name.length + ' characters'
				);

			this.#list[name] = options[name];
		}
	}

	/**
	 * Возвращает объект слеш-команд для дискорда
	 * @return {Object[]}
	 */
	toDiscord(){
		let options = [];

		for(let name in this.#list){
			options.push(this.#list[name].toDiscord(name));
		}

		return options;
	}

}

module.exports = SlashOptions;