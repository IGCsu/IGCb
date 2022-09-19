const SlashOptions = require('../../BaseClasses/SlashOptions');
const SlashOption = require('../../BaseClasses/SlashOption');
const LangSingle = require('../../BaseClasses/LangSingle');

module.exports = new SlashOptions({

	nick: new SlashOption({
		type: SlashOption.types.STRING,
		required: true,
		description: new LangSingle({
			ru: "Введите любой желаемый никнейм",
			en: "Enter any nickname you want",
			uk: "Введіть будь-який бажаний нікнейм"
		})
	})
});