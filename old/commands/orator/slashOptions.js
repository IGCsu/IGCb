const SlashOptions = require('../../BaseClasses/SlashOptions.js');
const SlashOption = require('../../BaseClasses/SlashOption.js');
const LangSingle = require('../../BaseClasses/LangSingle.js');

module.exports = new SlashOptions({

	user: new SlashOption({
		type: SlashOption.types.USER,
		required: true,
		description: new LangSingle({
			ru: 'Участник Сообщества у которого будет переключена роль Младший Оратор',
			en: 'Community member whose Младший Оратор role will be switched',
			uk: 'Користувач спільноти у якого буде змінюватися роль Младший Оратор'
		})
	})

});