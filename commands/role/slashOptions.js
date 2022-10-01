const SlashOptions = require('../../BaseClasses/SlashOptions');
const SlashOption = require('../../BaseClasses/SlashOption');
const LangSingle = require('../../BaseClasses/LangSingle');

module.exports = new SlashOptions({

	role: new SlashOption({
		type: SlashOption.types.STRING,
		required: true,
		autocomplete: true,
		description: new LangSingle({
			ru: 'Имя роли или её ID',
			en: 'Role name or ID',
			uk: 'Назва ролі або її ID'
		})
	}),

	members: new SlashOption({
		type: SlashOption.types.STRING,
		required: false,
		description: new LangSingle({
			ru: 'Укажите упоминания пользователя/ей его/их ID',
			en: 'Specify the mention of the user(s) his/her/their ID',
			uk: 'Вкажіть згадування користувача або його ID'
		})
	}),

	create: new SlashOption({
		type: SlashOption.types.BOOLEAN,
		required: false,
		description: new LangSingle({
			ru: 'Создать роль если не было найдено таковой?',
			en: 'Create a role if no one was found?',
			uk: 'Створити роль, якщо вона відсутня?'
		})
	})

});