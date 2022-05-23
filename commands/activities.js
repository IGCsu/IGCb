module.exports = {

	active : true,
	category : 'Голосовые каналы',

	name : 'activities',
	title : { 'ru':'Activities' },
	description : {
		'ru':'Создание Discord activities в голосовых каналах',
		'en':'Creating Discord activities in voice channels',
		'uk':'Створення Discord activities у голосових каналах',
	},

	slashOptions : {

		channel : {
			type : 7,
			required : true,
			channel_types : [2],
			description : {
				'ru':'Выберите голосовой канал',
				'en':'Choose voice channel',
				'uk':'Оберіть голосовий канал',
			}
		},

		activity : {
			type : 3,
			required : true,
			choices : {
				'880218394199220334' : { ru : 'Watch together' },
				'755827207812677713' : { ru : 'Poker Night' },
				'773336526917861400' : { ru : 'Betrayal.io' },
				'814288819477020702' : { ru : 'Fishington.io' },
				'832012774040141894' : { ru : 'Chess In The Park' },
				'879864070101172255' : { ru : 'Sketchy Artist' },
				'879863881349087252' : { ru : 'Awkword' },
				'832012854282158180' : { ru : 'Putts' },
				'878067389634314250' : { ru : 'Doodle Crew' },
				'879863686565621790' : { ru : 'Letter Tile' },
				'879863976006127627' : { ru : 'Word Snacks' },
				'852509694341283871' : { ru : 'SpellCast' },
				'832013003968348200' : { ru : 'Checkers In The Park' },
				'832025144389533716' : { ru : 'CG4 Prod' }
			},
			description : {
				'ru':'Выберите activity',
				'en':'Choose activity',
				'uk':'Оберіть activity',
			}
		}

	},

	init : function(){ return this; },

	/**
	 * Выставляет активность указанному каналу
	 *
	 * @param {CommandInteraction} int Команда пользователя
	*/
	slash : async function(int){
		const invite = await client.api.channels(int.options.get('channel').value).invites.post({
			data : { target_type : 2, target_application_id : int.options.get('activity').value }
		});

		int.reply({
			content : `Приглашение сгенерированно, нажмите на кнопку ниже чтобы присоедениться к activity.`,
			components : [{
				type : 1,
				components : [{ type : 2, style : 5, url : 'https://discord.gg/' + invite.code, label : 'Присоединиться'}]
			}]
		});
	},

};
