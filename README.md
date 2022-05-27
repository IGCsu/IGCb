# Бот сообщества IGC.

Сайт сообщества: https://igc.su.

#### Файлы репозитория:
- `/bot.js` - индексный файл: подключается `discord.js` и устанавливается соединение, после которого запускается `/init.js`.
- `/init.js` - основной файл инициализации: добавляются файлы локализации из `/locales/`, добавляются функции из `/functions/` и запускается `/initCommands.js`. Выставляется активити боту, прекращается работа дублей и инициализируется прослушка ивентов "messageCreate" и "interactionCreate".
- `/initCommands.js` - файл инициализации команд: инициализируются все модули из `/commands/`.

#### Модули бота
Вся логика бота разбита на отдельные и независимые модули, каждый из которых может быть отключён.
Модули содержатся в `/commands/` в качестве отдельных папок.
Папка модуля обязательно должна содержать индексный файл `./index.js`, который будет вызываться из `/initCommands.js`.
Модуль должен экспортировать объект модуля:
```js
module.exports = {

	/**
	 * Содержит значение активности модуля. Используется для проверки другими модулями.
	 * Вне зависимости от значения будет подключен и инициализирован.
	 */
	active: (Boolean), // required

	/**
	 * Категория модуля. Допускается любое значение.
	 */
	category: (String), // not required (default: "Остальные")

	/**
	 * Название модуля. Должно быть идентично названию файла.
	 */
	name: (String), // required, lower case only (!)

	/**
	 * Короткое обозначение модуля. Содержит объект локализации.
	 * Обязательная локализация - русская.
	 * Для обозначений языков используется формат ISO 639-1
	 */
	title: (Object) { // required
		[Language code ISO 639-1]: (String)
	},

	/**
	 * Подсказка для слеш-команды. Содержит объект локализации.
	 * Обязательная локализация - русская.
	 * Для обозначений языков используется формат ISO 639-1.
	 */
	description: (Object) { // not required (default: this.title)
		[Language code ISO 639-1]: (String)
	},

	/**
	 * Опции для слеш-команды. Нужно использовать только если слеш-команде нужны какие то опции.
	 */
	slashOptions: (Object) { // not required

		/**
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
		[Options name]: (Object) {

			/**
			 * Тип опции.
			 * https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-type
			 */
			type: (Number), // required

			required: (Boolean), // not required (default: false)

			/**
			 * Подсказка для опции. Содержит объект локализации.
			 * Обязательная локализация - русская.
			 * Для обозначений языков используется формат ISO 639-1.
			 */
			description: (Object) { // required
 				[Language code ISO 639-1]: (String)
 			},

			/**
			 * Опции для опции. Используется для более сложных опций.
			 */
			slashOptions: (Object) { // not required
				[Options name] (Object) { ... }
			},

			/**
			 * Варианты выбора.
			 */
			choices: {  // not required
				[Value choices] : (Object) {
	 				[Language code ISO 639-1]: (String)
	 			}
			}

		}

	},



	/**
	 * Функция инициализации. Используется при инициализации модуля.
	 * Принимает путь к текущему файлу. Может быть использовано для логирования.
	 * Всегда должен возвращать объект модуля (this).
	 * @param  {String} path Путь к файлу
	 * @return {Object}      this
	 */
	init: async function(path){ // required

		// Пример ошибки: в лог инициализации добавляется ошибка, а модуль перестаёт быть активным.
		if(error){
			log.initText += log.error(path + ': Произошла ошибка');
			this.active = false;
			return this;
		}

		return this;
	},


	/**
	 * Индексная функция модуля. Используется для базовой логики и вызовов из входных функций
	 */
	call: (Function), // required

	/**
	 * Функция обработки slash-команды.
	 * Если функция существует - то при инициализации будет добавлена слеш-команда с данными модуля и slashOptions, если тот имеется.
	 * @param {CommandInteraction} int
	 */
	slash: async function(int){ // not required
		await this.call(int);
	},

	/**
	 * Функция обработки контекстной команды на сообщении.
	 * Если функция существует - то при инициализации будет добавлена контекстная-команда на сообщение.
	 * @param {ContextMenuInteraction} int
	 */
	contextMesage: async function(int){ // not required
		await this.call(int);
	},

	/**
	 * Функция обработки контекстной команды на пользователе.
	 * Если функция существует - то при инициализации будет добавлена контекстная-команда на пользователей.
	 * @param {UserContextMenuInteraction} int
	 */
	contextUser: async function(int){ // not required
		await this.call(int);
	},

	/**
	 * Функция обработки автозаполнения.
	 * https://discord.js.org/#/docs/discord.js/stable/class/AutocompleteInteraction
	 * @param {AutocompleteInteraction} int
	 */
	autocomplete: (Function), // not required

	/**
	 * Функция обработки модального окна.
	 * https://discord.js.org/#/docs/discord.js/stable/class/ModalSubmitInteraction
	 * @param {ModalSubmitInteraction} int
	 */
	modal: (Function), // not required

	/**
	 * Функция обработки кнопок.
	 * https://discord.js.org/#/docs/discord.js/stable/class/MessageComponentInteraction
	 * @param {MessageComponentInteraction} int
	 */
	button: (Function), // not required

	/**
	 * Функция обработки селектора.
	 * https://discord.js.org/#/docs/discord.js/stable/class/SelectMenuInteraction
	 * @param {SelectMenuInteraction} int
	 */
	selectMenu: (Function) // not required


};
```
При разработке рекомендуется максимально разбивать код по файлам. Например, во всех модулях вынесены параметры "slashOptions", "title" и "description" в отдельные файлы `./slashOptions.json` и `./about.json`.

Модули добавляются в глобальную переменную `commands`, и её можно использовать для доступа к другим модулям.

У модулей не обязательно должны быть входные файлы типа "slash" или "contextUser". Например модуль `starboard` не имеет выходных файлов, а вызывается лишь из модуля `nocommand`.

#### Функции бота
Бот имеет вспомогательные функции. Они расположены в `/functions/` в виде отдельных файлов.
Файл функции должен экспортировать функцию.
При инициализации бота, функции помещаются в `global` под названием файла.

Функции отличаются от модулей своей примитивностью. Это простые функции с функциональным подходом: должны что то принимать, что то делать и что то возвращать.

Цель таких функций - выполнение базовых задач, которые не относятся к какому либо модулю.
Рекомендуется создавать функции только если предполагается их применение в разных модулях.
В функциях допустима инкапсуляция.

#### Локализация бота
Файлы локализации расположены в двух директориях: `/helpTexts/` и `/locales/`.

В `/locales/` содержатся файлы в формате `.json`, стандартная локализация.

В `/helpTexts/` содержатся файлы в формате `.md`. Эти файлы содержат подробную информацию о модуле. Используется в модуле `help`.
Если файл существует, при help-запросе с указанным модулем, то текст будет выведен в эмбед.
