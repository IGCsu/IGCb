const slashOptions = require('./slashOptions.json');
const { title, description } = require('./about.json');

module.exports = {

	active : true,
	category : 'Голосовые каналы',

	name : 'activities',
	title : title,
	description : description,
	slashOptions : slashOptions,

	init : function(){ return this; },


	/**
	 * Генерирует и отправляет приглашение к голосовому каналу с выбранным Activity
	 *
	 * @param {CommandInteraction} int Команда пользователя
	*/
	slash : async function(int){

		const lang = int.locale.split('-')[0];

		const channel = int.options.get('channel').value;
		const activityId = int.options.get('activity').value;

		const activity = this.slashOptions.activity.choices[activityId];
		const activityName = activity[lang] ?? activity.ru

		const invite = await client.api.channels(channel).invites.post({
			data : {
				target_type : 2,
				target_application_id : activityId
			}
		});

		int.reply({
			content : 'Приглашение сгенерированно, нажмите на кнопку ниже чтобы присоедениться к ' + activityName,
			components : [{
				type : 1,
				components : [{
					type : 2,
					style : 5,
					url : 'https://discord.gg/' + invite.code,
					label : 'Присоединиться'
				}]
			}]
		});

	},

};
