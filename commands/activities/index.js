const slashOptions = require('./slashOptions.json');
const fetch = require('node-fetch');
const { title, description } = require('./about.json');

module.exports = {

	active : true,
	category : 'Голосовые каналы',

	name : 'activities',
	title : title,
	description : description,
	slashOptions : slashOptions,

	init : async function(){
		await this.updateActivities();

		return this;
	},


	/**
	 * Генерирует и отправляет приглашение к голосовому каналу с выбранным Activity
	 *
	 * @param {CommandInteraction} int Команда пользователя
	*/
	slash : async function(int){

		const lang = int.locale.split('-')[0];

		const channel = int.options.get('channel')?.value ?? int.member.voice.channelId;
		const activityId = int.options.get('activity').value;

		const activity = this.activitiesCache.find(a => a.value === activityId);

		if(!channel)
			return int.reply({
				content: reaction.emoji.error + ' ' +
					int.str('You are not connected to a voice channel and did not specify a channel'),
				ephemeral: true
			});

		const invite = await client.api.channels(channel).invites.post({
			data : {
				target_type : 2,
				target_application_id : activityId
			}
		});

		await int.reply({
			content : 'Приглашение сгенерированно, нажмите на кнопку ниже чтобы присоедениться к ' + activity.name,
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

	autocomplete: async function(int){
		await int.respond(this.activitiesCache);

		if(this.activitiesCacheLastUpdate + 1000*60*60 < Date.now()){
			await this.updateActivities();
		}
	},

	/**
	 * Обновление списка активностей
	 */
	updateActivities: async function(){
		const data = await (await fetch('https://derpystuff.gitlab.io/webstorage/discord/activities/ids.json')).json();

		this.activitiesCache = [];
		this.activitiesCacheLastUpdate = Date.now();

		for(const key in data){
			this.activitiesCache.push({ name: key, value: data[key] });
		}
	}

};
