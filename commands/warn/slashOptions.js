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
					en: 'TODO',
					uk: 'TODO'
				}),
				slashOptions: new SlashOptions({
					id: new SlashOption({
						type: 4,
						description: new LangSingle({
							ru: 'ID необходимомого варна',
							en: 'TODO',
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
					en: 'TODO',
					uk: 'TODO'
				}),
				slashOptions: new SlashOptions({
					user: new SlashOption({
						type: 6,
						description: new LangSingle({
							ru: 'Пользователь последний варн которого требуется (Общий последний варн если оставить пустым)',
							en: 'TODO',
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
					en: 'TODO',
					uk: 'TODO'
				}),
				slashOptions: new SlashOptions({
					user: new SlashOption({
						type: 6,
						description: new LangSingle({
							ru: 'Пользователь список варнов которого требуется',
							en: 'TODO',
							uk: 'TODO'
						}),
						required: true
					}),
					ephemeral: new SlashOption({
						type: 5,
						description: new LangSingle({
							ru: 'Скрыть сообщение для остальных?',
							en: 'TODO',
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
					en: 'TODO',
					uk: 'TODO'
				}),
				slashOptions: new SlashOptions({
					string: new SlashOption({
						type: 3,
						description: new LangSingle({
							ru: 'Любая информация которая может быть связана с варном (никнеймы не поддерживаются. Используйте ID)',
							en: 'TODO',
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
			en: 'TODO',
			uk: 'TODO'
		}),
		slashOptions: new SlashOptions({
			user: new SlashOption({
				type: 6,
				description: new LangSingle({
					ru: 'Пользователь которому требуется выдать варн',
					en: 'TODO',
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
			en: 'TODO',
			uk: 'TODO'
		}),
		slashOptions: new SlashOptions({
			direct: new SlashOption({
				type: 1,
				description: new LangSingle({
					ru: 'Удаление варна через ID',
					en: 'TODO',
					uk: 'TODO'
				}),
				slashOptions: new SlashOptions({
					id: new SlashOption({
						type: 4,
						description: new LangSingle({
							ru: 'ID необходимомого варна',
							en: 'TODO',
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
					en: 'TODO',
					uk: 'TODO'
				}),
				slashOptions: new SlashOptions({
					user: new SlashOption({
						type: 6,
						description: new LangSingle({
							ru: 'Пользователь последний варн которого требуется (Общий последний варн если оставить пустым)',
							en: 'TODO',
							uk: 'TODO'
						}),
						required: false
					})
				})
			})
		})
	})
});