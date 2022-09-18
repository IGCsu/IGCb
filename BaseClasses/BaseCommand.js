const LangSingle = require('./LangSingle');
const SlashOptions = require('./SlashOptions');

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
	description;

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
	call(e){ return 'DefaultFunction'; };

	/**
	 * Обработка слеш-команды
	 * @param {CommandInteraction} e Команда пользователя
	 */
	slash(e){ return 'DefaultFunction'; };

	/**
	 * Обработчик сообщений пользователя
	 * @param {Message} e Сообщение пользователя
	 */
	message(e){ return 'DefaultFunction'; };

	/**
	 * Обработка контекстной команды на пользователя
	 * @param {UserContextMenuInteraction} e
	 */
	contextUser(e){ return 'DefaultFunction'; };

	/**
	 * Обработка контекстной команды на сообщение
	 * @param {MessageContextMenuInteraction} e
	 */
	contextMessage(e){ return 'DefaultFunction'; };

	/**
	 * Обработка подсказок при вводе
	 * @param {AutocompleteInteraction} e
	 */
	autocomplete(e){ return 'DefaultFunction'; };

	/**
	 * Обработка нажатия на кнопку
	 * @param {ButtonInteraction} e
	 */
	button(e){ return 'DefaultFunction'; };

	/**
	 * Обработка взаимодействия с селектором
	 * @param {SelectMenuInteraction} e
	 */
	selectMenu(e){ return 'DefaultFunction'; };

	/**
	 * Обработка модалки
	 * @param {ModalSubmitInteraction} e
	 */
	modal(e){ return 'DefaultFunction'; };

}

module.exports = BaseCommand;