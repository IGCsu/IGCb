module.exports = {

	active : true,
	name : 'poll',
	title : 'Опросы',
	descriptionShort : 'Позволяет создавать общие и модераторские опросы',
	category : 'Утилиты',

	slashOptions : [
		{
			name : 'common',
			description : 'Общий опрос',
			type : 1,
			options : [
				{
					name : 'question',
					description : 'Задайте вопрос',
					type : 3,
					required : true,
				}
			]
		},
		{
			name : 'senate',
			description : 'Опрос среди модераторов',
			type : 1,
			options : [
				{
					name : 'question',
					description : 'Задайте вопрос',
					type : 3,
					required : true,
				}
			]
		},
		{
			name : 'show',
			description : 'Показать информацию о любом опросе',
			type : 1,
			options : [
				{
					name : 'search',
					description : 'Укажите любую информацию которая может быть связана с опросом',
					type : 3,
					required : true,
				}
			]
		},
	],

	init : function(){ return this; },

	/**
	 * @param {Object} int CommandInteraction
	 */
	slash : async function(int){
        const type = int.options.getSubcommand();
        if(type == 'common' || type == 'senate'){
            const question = int.options.data[0].options[0].value;
            const txt = (type == 'common' ? 'Общий' : 'Закрытый' )
            await int.reply({content: `${txt} опрос: ${question}`, components:[{type : 1, components: [{type : 2, style: 3, customId:'poll|yes', label:'За'}, {type : 2, style: 4, customId:'poll|no', label:'Против'}]}], allowed_mentions:{parse:[]}})
        };
    },
    button : async function(int){
        //int.reply({content: 'В разработке', ephemeral: true});
		const type = int.customId.split('|')[1]
		if(type == 'senate' && (int.member.roles.cache.get('916999822693789718') || int.member.roles.cache.get('613412133715312641'))){
			await int.reply({content: 'Отказано в достпуе', ephemeral: true})
		}
		await client.api.interactions(int.id, int.token).callback.post({
			data:{
				type: 9,
				data: {
					title: 'Подтверждение голоса',
					custom_id: 'poll|' + type + '|' + int.message.content.split(': ')[1],
					components:[{
						type: 1,
						components:[{
							type: 4,
							custom_id: 'opininon',
							label: 'Почему вы выбрали именно \"' + ((type == 'yes') ? 'За': 'Против') + '\"',
							style: 2,
							min_length: 25,
							max_length: 1000,
							placeholder: 'Введите ваше ценное мнение',
							required: true
						}]
					}],
				}
			}
		})
    },
	modal : async function(int){
		console.log(int.data.custom_id.split('|')[2] + ' ' + int.member.user.username + ' ' + (int.data.custom_id.split('|')[1] == 'yes') ? 'за' : 'против' + ' : ' + int.data.components[0].components[0].value)
		await client.api.interactions(int.id, int.token).callback.post({
			data:{
				type: 4,
				data: {
					content: 'Голос подтверждён',
					flags: 64
				}
			}
		})
	}
};