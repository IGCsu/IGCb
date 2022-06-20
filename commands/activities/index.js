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
		this.activitiesCache = await resolveCache((await fetch('https://derpystuff.gitlab.io/webstorage/discord/activities/ids.json')).content);
		this.activitiesCacheLastUpdate = new Date().getTime();
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

		const activity = this.slashOptions.activity.choices[activityId];
		const activityName = activity[lang] ?? activity.ru

		if(!channel)
			return int.reply({
				content: reaction.emoji.error + ' ' +
					localize(int, 'You are not connected to a voice channel and did not specify a channel'),
				ephemeral: true
			});

		const invite = await client.api.channels(channel).invites.post({
			data : {
				target_type : 2,
				target_application_id : activityId
			}
		});

		await int.reply({
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

	autocomplete: async function(int){
		await int.respond(this.activitiesCache)

		if(this.activitiesCacheLastUpdate + 1000*60*60 < new Date().getTime()){
			this.activitiesCache = await resolveCache((await fetch('https://derpystuff.gitlab.io/webstorage/discord/activities/ids.json')).content);
			this.activitiesCacheLastUpdate = new Date().getTime();
		}
	},

	resolveCache: async function(rawCache){
		rawCache = JSON.parse(rawCache);
		let choices = [];
		console.log('Resolving activities cache')
		for (const property in rawCache) {
			choices.push({name: property, value: rawCache[property]})
		};
		console.log('Activities cache resolved')
		return choices;
	}

};
