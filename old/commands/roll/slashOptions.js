const SlashOptions = require('../../BaseClasses/SlashOptions.js');
const SlashOption = require('../../BaseClasses/SlashOption.js');
const LangSingle = require('../../BaseClasses/LangSingle.js');

module.exports = new SlashOptions({

	min: new SlashOption({
		type: SlashOption.types.INTEGER,
		required: false,
		description: new LangSingle({
			ru: 'Минимальное значение (По умолчанию 1)',
			en: 'Minimum value (Default 1)',
			uk: 'Мінімальне значення (За замовчуванням 1)'
		})
	}),

	max: new SlashOption({
		type: SlashOption.types.INTEGER,
		required: false,
		description: new LangSingle({
			ru: 'Максимальное значение (По умолчанию 100)',
			en: 'Maximum value (Default 100)',
			uk: 'Максимальне значення (За замовчуванням 100)'
		})
	})

});