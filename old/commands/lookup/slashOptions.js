const SlashOptions = require('../../BaseClasses/SlashOptions.js');
const SlashOption = require('../../BaseClasses/SlashOption.js');
const LangSingle = require('../../BaseClasses/LangSingle.js');

module.exports = new SlashOptions({

	id: new SlashOption({
		type: SlashOption.types.STRING,
		required: true,
		description: new LangSingle({
			ru: 'ID юзера или приглашения',
			en: 'User or invite ID',
			uk: 'ID користувача/запрошення'
		})
	})

});