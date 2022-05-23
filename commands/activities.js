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

	slashOptions : [
		{
			type :7,
			name : 'channel',
			name_localizations : {'ru': 'канал', 'uk': 'канал'},
			description : 'Choose voice channel',
			description_localizations : {'ru': 'Выберите голосовой канал', 'uk': 'Оберіть голосовий канал'},
			required : true,
			channel_types : [ 2 ]
		},
		{
			type : 3,
			name : 'activity',
			description :'Choose activity',
			description_localizations : {'ru': 'Выберите activity', 'uk': 'Оберіть activity'},
			required : true,
			choices : [
				{ value : '880218394199220334', name : "Watch together" },
				{ value : '755827207812677713', name : "Poker Night" },
				{ value : '773336526917861400', name : "Betrayal.io" },
				{ value : '814288819477020702', name : "Fishington.io" },
				{ value : '832012774040141894', name : "Chess In The Park" },
				{ value : '879864070101172255', name : "Sketchy Artist" },
				{ value : '879863881349087252', name : "Awkword" },
				{ value : '832012854282158180', name : "Putts" },
				{ value : '878067389634314250', name : "Doodle Crew" },
				{ value : '879863686565621790', name : "Letter Tile" },
				{ value : '879863976006127627', name : "Word Snacks" },
				{ value : '852509694341283871', name : "SpellCast" },
				{ value : '832013003968348200', name : "Checkers In The Park" },
				{ value : '832025144389533716', name : "CG4 Prod" }
			]
		}
	],

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
