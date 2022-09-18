const LangSingle = require('LangSingle');
const SlashOptions = require('SlashOptions');

class BaseCommand {

	/**
	 * Содержит значение активности модуля. Используется для проверки другими модулями.
	 * Вне зависимости от значения, будет подключен и инициализирован.
	 * @type {boolean}
	 */
	active = false;

	/**
	 * Категория модуля
	 * @type {string}
	 */
	category = 'Остальные';

	/**
	 * Название модуля. Идентично названию файла.
	 * @type {string}
	 */
	name;

	/**
	 * Короткое обозначение модуля. Содержит объект локализации.
	 * @type {LangSingle}
	 */
	title;

	/**
	 * Подсказка для слеш-команды. Содержит объект локализации.
	 * @type {LangSingle}
	 */
	#description;

	/**
	 * Кэш модуля. Может использоваться для разных целей.
	 */
	#cache;

	/**
	 * Подсказка для слеш-команды. Содержит объект локализации.
	 * @type {LangSingle}
	 */
	get description(){
		return this.#description ?? this.title;
	}

	/**
	 * Опции для слеш-команды. Если слеш-команде не нужны опции, то может содержать undefined
	 * @type {SlashOptions}
	 */
	slashOptions;

	/**
	 * Функция инициализации. Используется при инициализации модуля.
	 * Принимает путь к текущему файлу. Может быть использовано для логирования.
	 * @example await new Class()
	 * @param {string} path Путь к файлу
	 * @return {Promise<this>}
	 * @constructor
	 */
	constructor(path){
		this.active = true;

		// return new Promise(resolve => {
		// 	resolve(this);
		// });
	}

	/**
	 * Функция отключения модуля. Инвертирует действия функции инициализации, закрывая соединения, очищая буферы и тп.
	 * @return {Promise<this>}
	 */
	destroy(){
		this.active = false;

		// return new Promise(resolve => {
		// 	resolve(this);
		// });
	}

	/**
	 * Исполняемый метод команды. Содержит базовую логику
	 * @type {function}
	 */
	call;

	/**
	 * Обработка слеш-команды
	 * @param {CommandInteraction} int Команда пользователя
	 */
	slash = constants.DEFAULT_FUNC;

	/**
	 * Обработчик сообщений пользователя
	 * @param {Message} msg Сообщение пользователя
	 */
	message = constants.DEFAULT_FUNC;

	/**
	 * Обработка контекстной команды на пользователя
	 * @param {UserContextMenuInteraction} int
	 */
	contextUser = constants.DEFAULT_FUNC;

	/**
	 * Обработка контекстной команды на сообщение
	 * @param {MessageContextMenuInteraction} int
	 */
	contextMessage = constants.DEFAULT_FUNC;

	/**
	 * Обработка подсказок при вводе
	 * @param {AutocompleteInteraction} int
	 */
	autocomplete = constants.DEFAULT_FUNC;

	/**
	 * Обработка нажатия на кнопку
	 * @param {ButtonInteraction} int
	 */
	button = constants.DEFAULT_FUNC;

	/**
	 * Обработка взаимодействия с селектором
	 * @param {SelectMenuInteraction} int
	 */
	selectMenu = constants.DEFAULT_FUNC;

	/**
	 * Обработка модалки
	 * @param {ModalSubmitInteraction} int
	 */
	modal = constants.DEFAULT_FUNC;

}

module.exports = BaseCommand;