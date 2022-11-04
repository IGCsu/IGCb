const SlashOptions = require('../../BaseClasses/SlashOptions');
const SlashOption = require('../../BaseClasses/SlashOption');
const LangSingle = require('../../BaseClasses/LangSingle');

module.exports = new SlashOptions({

	get: new SlashOption({
		type: 2,
		description: new LangSingle({
			ru: 'Группа подкоманд для получения информации о варнах',
			en: 'TODO',
			uk: 'TODO'
		}),
		slashOptions: new SlashOptions({
			direct: new SlashOption({
				type: 1,
				description: new LangSingle({
					ru: 'Получения информации о варнах через ID',
					en: 'Getting information about warns via ID',
					uk: 'TODO'
				}),
				slashOptions: new SlashOptions({
					id: new SlashOption({
						type: 4,
						description: new LangSingle({
							ru: 'ID необходимомого варна',
							en: 'Warn ID',
							uk: 'TODO'
						}),
						required: true
					})
				})
			}),
			last: new SlashOption({
				type: 1,
				description: new LangSingle({
					ru: 'Получения информации о последнем варне',
					en: 'Getting information about last warn',
					uk: 'TODO'
				}),
				slashOptions: new SlashOptions({
					user: new SlashOption({
						type: 6,
						description: new LangSingle({
							ru: 'Пользователь последний варн которого требуется (Общий последний варн если оставить пустым)',
							en: 'User whose last warn is required (General last warn if empty)',
							uk: 'TODO'
						}),
						required: false
					})
				})
			}),
			list: new SlashOption({
				type: 1,
				description: new LangSingle({
					ru: 'Листаемый список всех варнов пользователя',
					en: 'A scrollable list of all warps of the user',
					uk: 'TODO'
				}),
				slashOptions: new SlashOptions({
					user: new SlashOption({
						type: 6,
						description: new LangSingle({
							ru: 'Пользователь список варнов которого требуется',
							en: 'A user whose list of warns is required',
							uk: 'TODO'
						}),
						required: true
					}),
					ephemeral: new SlashOption({
						type: 5,
						description: new LangSingle({
							ru: 'Скрыть сообщение для остальных?',
							en: 'Hide the message for others?',
							uk: 'TODO'
						}),
						required: false
					})
				})
			}),
			search: new SlashOption({
				type: 1,
				description: new LangSingle({
					ru: 'Поиск варнов',
					en: 'Warns search',
					uk: 'TODO'
				}),
				slashOptions: new SlashOptions({
					string: new SlashOption({
						type: 3,
						description: new LangSingle({
							ru: 'Любая информация которая может быть связана с варном (Никнеймы не поддерживаются. Используйте ID)',
							en: 'Any information that can be associated with a warn (Nicknames are not supported. Use IDs instead)',
							uk: 'TODO'
						}),
						required: true,
						autocomplete: true
					})
				})
			})
		})
	}),
	add: new SlashOption({
		type: 1,
		description: new LangSingle({
			ru: 'Подкоманда для добавления нового варна',
			en: 'Subcommand for adding a new warn',
			uk: 'TODO'
		}),
		slashOptions: new SlashOptions({
			user: new SlashOption({
				type: 6,
				description: new LangSingle({
					ru: 'Пользователь которому требуется выдать варн',
					en: 'A user who needs to be given a warn',
					uk: 'TODO'
				}),
				required: true
			})
		})

	}),
	remove: new SlashOption({
		type: 2,
		description: new LangSingle({
			ru: 'Группа подкоманд для удаления варнов',
			en: 'Subcommand group for removing warns',
			uk: 'TODO'
		}),
		slashOptions: new SlashOptions({
			direct: new SlashOption({
				type: 1,
				description: new LangSingle({
					ru: 'Удаление варна через ID',
					en: 'Removing warn via ID',
					uk: 'TODO'
				}),
				slashOptions: new SlashOptions({
					id: new SlashOption({
						type: 4,
						description: new LangSingle({
							ru: 'ID необходимомого варна',
							en: 'Warn ID',
							uk: 'TODO'
						}),
						required: true
					})
				})
			}),
			last: new SlashOption({
				type: 1,
				description: new LangSingle({
					ru: 'Удаление последнего варна',
					en: 'Removes last warn',
					uk: 'TODO'
				}),
				slashOptions: new SlashOptions({
					user: new SlashOption({
						type: 6,
						description: new LangSingle({
							ru: 'Пользователь последний варн которого требуется (Общий последний варн если оставить пустым)',
							en: 'User whose last warn is required (General last warn if empty)',
							uk: 'TODO'
						}),
						required: false
					})
				})
			})
		})
	})
});