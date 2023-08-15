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
				ru: 'Добавить упоминание игроков (есть таймаут)',
				en: 'Add mention of players (there is a timeout)',
				uk: 'Додати згадку гравців (є таймаут)'
			}),
			public: new LangSingle({
				ru: 'Отобразить сообщение для остальных',
				en: 'Show message for others',
				uk: 'Відобразити повідомлення для інших'
			})
		}
	})

});
