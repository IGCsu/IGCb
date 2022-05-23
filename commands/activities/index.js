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
