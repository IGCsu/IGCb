const SlashOptions = require('../../BaseClasses/SlashOptions');
const SlashOption = require('../../BaseClasses/SlashOption');
const LangSingle = require('../../BaseClasses/LangSingle');

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