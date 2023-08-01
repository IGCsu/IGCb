const SlashOptions = require('../../BaseClasses/SlashOptions.js');
const SlashOption = require('../../BaseClasses/SlashOption.js');
const LangSingle = require('../../BaseClasses/LangSingle.js');

module.exports = new SlashOptions({

	activity: new SlashOption({
		type: SlashOption.types.STRING,
		required: true,
		autocomplete: true,
		description: new LangSingle({
			ru: 'Выберите activity',
			en: 'Choose activity',
			uk: 'Оберіть activity'
		})
	}),

	channel: new SlashOption({
		type: SlashOption.types.CHANNEL,
		channel_types: [SlashOption.channelTypes.GUILD_VOICE],
		description: new LangSingle({
			ru: 'Выберите голосовой канал',
			en: 'Choose voice channel',
			uk: 'Оберіть голосовий канал'
		})
	})

});