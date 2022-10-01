const SlashOptions = require('../../BaseClasses/SlashOptions');
const SlashOption = require('../../BaseClasses/SlashOption');
const LangSingle = require('../../BaseClasses/LangSingle');

module.exports = new SlashOptions({

	command: new SlashOption({
		type: SlashOption.types.STRING,
		required: false,
		autocomplete: true,
		description: new LangSingle({
			ru: 'Название модуля',
			en: 'Module name',
			uk: 'Назва модуля'
		})
	})

});
