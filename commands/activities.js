module.exports = {

	active : true,
	category : 'Голосовые каналы',

	name : 'activities',
	title : 'Activities',
	description : 'Позволяет создавать в голосовых каналах Discord activities',
	descriptionShort : 'Доступ к Discord activities',

	slashOptions : [
		{
			type:7,
			name: 'канал',
			description: 'Выберите голосовой канал',
			required: true,
			channel_types: [ 2 ]
		},
		{
		type: 3, 
		name: 'activity',
		description:'Выберите activity',
		required: true,
		choices: [
			{'name': "Watch together",          'value': '880218394199220334'},
			{'name': "Poker Night",             'value': '755827207812677713'},
			{'name': "Betrayal.io",             'value': '773336526917861400'},
			{'name': "Fishington.io",           'value': '814288819477020702'},
			{'name': "Chess In The Park",       'value': '832012774040141894'},
			{'name': "Sketchy Artist",          'value': '879864070101172255'},
			{'name': "Awkword",                 'value': '879863881349087252'},
			{'name': "Putts",                   'value': '832012854282158180'},
			{'name': "Doodle Crew",             'value': '878067389634314250'},
			{'name': "Letter Tile",             'value': '879863686565621790'},
			{'name': "Word Snacks",             'value': '879863976006127627'},
			{'name': "SpellCast",               'value': '852509694341283871'},
			{'name': "Checkers In The Park",    'value': '832013003968348200'},
			{'name': "CG4 Prod",                'value': '832025144389533716'}
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
		const invite = await client.api.channels(int.options.get('канал').value).invites.post({
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
