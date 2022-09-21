const SlashOptions = require('../../BaseClasses/SlashOptions');
const SlashOption = require('../../BaseClasses/SlashOption');
const LangSingle = require('../../BaseClasses/LangSingle');

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