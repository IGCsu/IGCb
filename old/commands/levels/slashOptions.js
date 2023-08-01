const SlashOptions = require('../../BaseClasses/SlashOptions.js');
const SlashOption = require('../../BaseClasses/SlashOption.js');
const LangSingle = require('../../BaseClasses/LangSingle.js');

module.exports = new SlashOptions({

	user: new SlashOption({
		type: SlashOption.types.USER,
		required: false,
		description: new LangSingle({
			ru: 'Чью статистику показать. По умолчанию вашу',
			en: 'Whose statistics to show. Yours by default',
			uk: 'Чию статистику показувати. Ваш за замовчуванням'
		})
	})

});