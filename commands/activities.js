module.exports = {

	active : true,
	name : 'activities',
	title : 'Activities',
	description : 'Позволяет создавать в голосовых каналах Discord activities',
    shortDescription : 'Доступ к Discord activities',
	category : 'Утилиты',


	init : function(){ return this; },

	/**
	 * @param {Object} int interaction
	*/ 
	slash : async function(int){
		const invite = await client.api.channels(int.options.get('канал')).invites.post({
            data: {
                target_type: 2,
                target_application_id: `${int.options.get('activity')}`
            }});
        int.reply({content: `Приглашение сгенерированно, нажмите на кнопку ниже чтобы активировать ${int.data.options[1].name}.`, components:[{type : 1, components: [{type : 2, style: 5, url:'https://discord.gg/' + invite.code, label:'Присоединиться'}]}]})
	},  
};