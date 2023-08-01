const SlashOptions = require('../../BaseClasses/SlashOptions.js');
const SlashOption = require('../../BaseClasses/SlashOption.js');
const LangSingle = require('../../BaseClasses/LangSingle.js');

module.exports = new SlashOptions({

	member: new SlashOption({
		type: SlashOption.types.USER,
		required: true,
		description: new LangSingle({
			ru: 'Пользователь у которого будет исправлен ник',
			en: 'The user whose nickname will be corrected',
			uk: 'Користувач чиє ім\"я буде виправленно'
		})
	})

});