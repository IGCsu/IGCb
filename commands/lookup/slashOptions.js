const SlashOptions = require('../../BaseClasses/SlashOptions');
const SlashOption = require('../../BaseClasses/SlashOption');
const LangSingle = require('../../BaseClasses/LangSingle');

module.exports = new SlashOptions({

	user: new SlashOption({
		type: SlashOption.types.STRING,
		required: true,
		description: new LangSingle({
			ru: "ID юзера или приглашения",
			en: "User or invite ID",
			uk: "ID користувача/запрошення"
		})
	})

});