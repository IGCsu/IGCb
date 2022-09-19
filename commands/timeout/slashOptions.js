const SlashOptions = require('../../BaseClasses/SlashOptions');
const SlashOption = require('../../BaseClasses/SlashOption');
const LangSingle = require('../../BaseClasses/LangSingle');

module.exports = new SlashOptions({

	user: new SlashOption({
		type: SlashOption.types.USER,
		required: true,
		description: new LangSingle({
			ru: "Участник Сообщества который будет отстранён от общения",
			en: "Community member who will be suspended from communication",
			uk: "Учасник Спільноти, який буде відсторонений від спілкування"
		})
	}),

	duration: new SlashOption({
		type: SlashOption.types.STRING,
		required: true,
		description: new LangSingle({
			ru: "Продолжительность таймаута. Формат времени: (1d6h30m5s)",
			en: "Timeout duartion. Time format: (1d6h30m5s)",
			uk: "Тривалість таймауту. Формат часу: (1d6h30m5s)"
		})
	}),

	reason: new SlashOption({
		type: SlashOption.types.STRING,
		required: false,
		autocomplete: true,
		description: new LangSingle({
			ru: "Причина таймаута. Будет видна в аудит логе и #некролог",
			en: "Reason for the timeout. It will be visible in the audit log and #некролог",
			uk: "Причина таймауту. Буде видно в аудит лозі і #некролог"
		})
	})
});