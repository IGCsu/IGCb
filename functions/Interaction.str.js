const {
	AutocompleteInteraction,
	ModalSubmitInteraction,
	UserContextMenuInteraction,
	MessageContextMenuInteraction,
	ButtonInteraction,
	SelectMenuInteraction,
	CommandInteraction
} = require('discord.js');

/**
 * Функция локализации.
 * Возвращает локализированный текст или исходный, если не находит
 * локализированный
 *
 * @param {string} lang Код локализации по стандарту ISO 639-1
 * @param {string} str Текст
 * @return {string}
 */
global._ = function (lang, str) {
	if (lang.length > 2) lang = lang.split('-')[0];

	return locales[lang]?.[str] ?? str;
};

/**
 * Функция локализации.
 * Возвращает локализированный текст или исходный, если не находит
 * локализированный
 *
 * @param {string} str Текст
 * @return {string}
 */
const func = function (str) {
	return _(this.locale, str);
};

/**
 * Возвращает локализованный или исходный текст
 *
 * @param {string} str Текст
 * @return {string}
 */
AutocompleteInteraction.prototype.str =
	ModalSubmitInteraction.prototype.str =
		UserContextMenuInteraction.prototype.str =
			MessageContextMenuInteraction.prototype.str =
				ButtonInteraction.prototype.str =
					SelectMenuInteraction.prototype.str =
						CommandInteraction.prototype.str = func;