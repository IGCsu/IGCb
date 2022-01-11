module.exports = {

	active : true,
	category : 'Голосовые каналы',

	name : 'activities',
	title : 'Activities',
	description : 'Позволяет создавать в голосовых каналах Discord activities',
	descriptionShort : 'Доступ к Discord activities',


	init : function(){ return this; },

	/**
	 * Выставляет активность указанному каналу
	 *
	 * @param {CommandInteraction} int Команда пользователя
	*/
	slash : async function(int){
		const invite = await client.api.channels(int.options.get('канал')).invites.post({
			data : { target_type : 2, target_application_id : int.options.get('activity') }
		});

		int.reply({
			content : `Приглашение сгенерированно, нажмите на кнопку ниже чтобы активировать ${int.data.options[1].name}.`,
			components : [{
				type : 1,
				components : [{ type : 2, style : 5, url : 'https://discord.gg/' + invite.code, label : 'Присоединиться'}]
			}]
		});
	},

};
