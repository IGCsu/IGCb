const LangSingle = require('./LangSingle');
const SlashOptions = require('./SlashOptions');

/**
 * Класс опции слеш комманд
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
class SlashOption {

	/**
	 * Тип опции.
	 * @see https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-type
	 * @type {number}
	 */
	type;

	/**
	 * Подсказка для опции. Содержит объект локализации.
	 * @type {LangSingle}
	 */
	description;

	/**
	 * Определяет, обязательна ли эта опция
	 * @type {boolean}
	 */
	required = false;

	/**
	 * Варианты выбора.
	 * Содержит в качестве ключа - вариант выбора.
	 * В качестве значение - описание выбора, подсказку.
	 * @type {Object.<string|number, LangSingle>}
	 */
	choices;

	/**
	 * Дополнительные опции для опции. Используется для более сложных опций.
	 * @type {SlashOptions}
	 */
	options;

	/**
	 * Типы каналов, доступные для выбора. Нужны, когда нужно выбрать канал
	 * @see https://discord.com/developers/docs/resources/channel#channel-object-channel-types
	 * @type {number[]}
	 */
	channel_types;

	/**
	 * Минимальное число
	 * @type {number}
	 */
	min_value;

	/**
	 * Максимальное число
	 * @type {number}
	 */
	max_value;

	/**
	 * Минимальная длина строки (0-6000)
	 * @type {number}
	 */
	min_length;

	/**
	 * Максимальная длина строки (1-6000)
	 * @type {number}
	 */
	max_length;

	/**
	 * Определяет, должно ли появляться подсказки-дополнения при вводе
	 * @type {boolean}
	 */
	autocomplete;

	/**
	 * @constructor
	 * @param {Object} data
	 * @param {number} data.type Тип опции
	 * @param {LangSingle} data.description Подсказка для опции
	 * @param {boolean} [data.required=false] Определяет, обязательна ли эта опция
	 * @param {Object.<string|number, LangSingle>} [data.choices] Варианты выбора
	 * @param {SlashOptions} [data.options] Дополнительные опции для опции
	 * @param {number[]} [data.channel_types] Типы каналов, доступные для выбора
	 * @param {number} [data.min_value] Минимальное число
	 * @param {number} [data.max_value] Максимальное число
	 * @param {number} [data.min_length] Минимальная длина строки (0-6000)
	 * @param {number} [data.max_length] Максимальная длина строки (1-6000)
	 * @param {boolean} [data.autocomplete] Определяет, должно ли появляться подсказки-дополнения при вводе
	 */
	constructor(data){

		if(data.min_length > 6000 || data.min_length < 0)
			throw new RangeError('Min length not valid');

		if(data.max_length > 6000 || data.max_length < 1)
			throw new RangeError('Min length not valid');

		this.type = data.type;
		this.description = data.description;
		this.required = data.required;
		this.choices = data.choices;
		this.options = data.options;
		this.channel_types = data.channel_types;
		this.min_value = data.min_value;
		this.max_value = data.max_value;
		this.min_length = data.min_length;
		this.max_length = data.max_length;
		this.autocomplete = data.autocomplete;

	}

	/**
	 * Возвращает объект слеш-команды для дискорда
	 */
	toDiscord(name){
		let data = {
			name: name,

			type: this.type,

			description: this.description.toString(),
			description_localizations: this.description.toDiscord(),
		};

		if(this.required) data.required = this.required;
		if(this.choices) data.choices = this.getChoicesDiscord();
		if(this.options) data.options = this.options.toDiscord();
		if(this.channel_types) data.channel_types = this.channel_types;
		if(this.min_value) data.min_value = this.min_value;
		if(this.max_value) data.max_value = this.max_value;
		if(this.min_length) data.min_length = this.min_length;
		if(this.max_length) data.max_length = this.max_length;
		if(this.autocomplete) data.autocomplete = this.autocomplete;

		return data;
	}

	/**
	 * Возвращает селектор слеш-команды отформатированный для дискорда
	 * @return {array}
	 */
	getChoicesDiscord(){
		let choices = [];

		for(let value in this.choices){
			choices.push({
				value: value,
				name: this.choices[value].toString(),
				name_localizations: this.choices[value].toDiscord()
			});
		}

		return choices;
	}

}

module.exports = SlashOption;