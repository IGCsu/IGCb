const SlashOptions = require('../../BaseClasses/SlashOptions');
const SlashOption = require('../../BaseClasses/SlashOption');
const LangSingle = require('../../BaseClasses/LangSingle');

module.exports = new SlashOptions({

	sync: new SlashOption({
		type: SlashOption.types.SUB_COMMAND,
		description: new LangSingle({
			ru: "Синхронизовать канал с базой данных",
			en: "Synchronize the channel with the database",
			uk: "Синхронізувати канал з базою даних"
		})
	}),

	upload: new SlashOption({
		type: SlashOption.types.SUB_COMMAND,
		description: new LangSingle({
			ru: "Загрузить конфигруацию в базу данных",
			en: "Upload the configuration to the database",
			uk: "Завантажити конфігурацію в базу даних"
		})
	}),

	'auto-sync': new SlashOption({
		type: SlashOption.types.SUB_COMMAND,
		slashOptions: new SlashOptions({

			mode: new SlashOption({
				type: SlashOption.types.STRING,
				required: true,
				choices: {
					0: new LangSingle({
						ru: "Отключена",
						en: "Disabled",
						uk: "Відключений"
					}),
					1: new LangSingle({
						ru: "Частичная (Настройки выгружаются из БД только при создании ГС)",
						en: "Partial (Settings are loaded from the DB only when creating a VC)",
						uk: "Часткова (Налаштування вивантажуються з БД тільки при створенні ГС)"
					}),
					2: new LangSingle({
						ru: "Полная",
						en: "Full",
						uk: "Полная"
					})
				},
				description: new LangSingle({
					ru: "Выберите режим автосинхронизации",
					en: "Select auto sync mode",
					uk: "Виберіть режим автосинхронізації"
				})
			})

		}),
		description: new LangSingle({
			ru: "Настройка автосинхронизации",
			en: "Setting up auto-synchronization",
			uk: "Настройка автосинхронизации"
		})
	}),

	'add-owner': new SlashOption({
		type: 1,
		slashOptions: new SlashOptions({

			member: new SlashOption({
				type: SlashOption.types.USER,
				required: true,
				description: new LangSingle({
					ru: "Пользователь которому будут выданы права",
					en: "The user to whom the perms will be granted",
					uk: "Користувач якому будуть видані права"
				})
			})

		}),
		description: new LangSingle({
			ru: "Дать права на управление каналом",
			en: "Grant channel management perms",
			uk: "Дати права на управління каналоми"
		})
	})
});