import SlashOptions from '../../BaseClasses/SlashOptions.js';
import SlashOption from '../../BaseClasses/SlashOption.js';
import LangSingle from '../../BaseClasses/LangSingle.js';

export const slashOptions = new SlashOptions({

	flag: new SlashOption({
		type: SlashOption.types.STRING,
		required: false,
		description: new LangSingle({
			ru: 'Дополнительное свойство',
			en: 'Additional feature',
			uk: 'Додаткова властивість'
		}),
		choices: {
			ping: new LangSingle({
				ru: 'Добавить упоминание игроков',
				en: 'Add a mention of players',
				uk: 'Додати згадування гравців'
			}),
			ephemeral: new LangSingle({
				ru: 'Скрыть сообщение для остальных',
				en: 'Hide message for others',
				uk: 'Приховати повідомлення для інших'
			})
		}
	})

});