const SlashOptions = require('../../BaseClasses/SlashOptions.js');
const SlashOption = require('../../BaseClasses/SlashOption.js');
const LangSingle = require('../../BaseClasses/LangSingle.js');

module.exports = new SlashOptions({

	nick: new SlashOption({
		type: SlashOption.types.STRING,
		required: true,
		description: new LangSingle({
			ru: 'Введите любой желаемый никнейм',
			en: 'Enter any nickname you want',
			uk: 'Введіть будь-який бажаний нікнейм'
		})
	})

});