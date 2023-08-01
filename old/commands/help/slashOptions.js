const SlashOptions = require('../../BaseClasses/SlashOptions.js');
const SlashOption = require('../../BaseClasses/SlashOption.js');
const LangSingle = require('../../BaseClasses/LangSingle.js');

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
