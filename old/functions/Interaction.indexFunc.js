const {
	AutocompleteInteraction,
	ModalSubmitInteraction,
	UserContextMenuInteraction,
	MessageContextMenuInteraction,
	ButtonInteraction,
	SelectMenuInteraction,
	CommandInteraction
} = require('discord.js');

/** Название входной функции модуля для AutocompleteInteraction
 * @type {string} */
AutocompleteInteraction.prototype.indexFunc = 'autocomplete';

/** Название входной функции модуля для ModalSubmitInteraction
 * @type {string} */
ModalSubmitInteraction.prototype.indexFunc = 'modal';

/** Название входной функции модуля для UserContextMenuInteraction
 * @type {string} */
UserContextMenuInteraction.prototype.indexFunc = 'contextUser';

/** Название входной функции модуля для MessageContextMenuInteraction
 * @type {string} */
MessageContextMenuInteraction.prototype.indexFunc = 'contextMessage';

/** Название входной функции модуля для ButtonInteraction
 * @type {string} */
ButtonInteraction.prototype.indexFunc = 'button';

/** Название входной функции модуля для SelectMenuInteraction
 * @type {string} */
SelectMenuInteraction.prototype.indexFunc = 'selectMenu';

/** Название входной функции модуля для CommandInteraction
 * @type {string} */
CommandInteraction.prototype.indexFunc = 'slash';