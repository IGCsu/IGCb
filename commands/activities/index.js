const SlashOptions = require('../../BaseClasses/SlashOptions');
const BaseCommand = require('../../BaseClasses/BaseCommand');
const LangSingle = require('../../BaseClasses/LangSingle');
const { AutocompleteInteraction, CommandInteraction} = require('discord.js')

const fetch = require('node-fetch');

const slashOptions = require('./slashOptions');
const { title, description } = require('./about.json');

class Activities extends BaseCommand {

	/**
	 * Кеш активностей
	 */
	#cache = [];

	/**
	 * Временная метка последнего обновления кеша
	 */
	#lastUpdate;

	/**
	 * @param {string} path Путь к файлу
	 * @return {Promise<this>}
	 * @constructor
	 */
	constructor(path){
		super(path);

		this.category = 'Голосовые каналы';
		this.name = 'activities';

		this.title = new LangSingle(title);
		this.description = new LangSingle(description);

		this.slashOptions = slashOptions;

		return new Promise(async resolve => {
			await this.updateActivities();

			resolve(this);
		});
	}

	/**
	 * Генерирует приглашение к голосовому каналу с выбранным Activity
	 * @param {CommandInteraction} int Команда пользователя
	 * @return {Promise<{activity: Object, invite: Object}>}
	 */
	async call(int){
		const channel = int.options.get('channel')?.value ?? int.member.voice.channelId;
		const activityId = int.options.get('activity').value;

		const activity = this.#cache.find(a => a.value === activityId);

		if(!channel) throw 'You are not connected to a voice channel and did not specify a channel';

		const invite = await client.api.channels(channel).invites.post({
			data: {
				target_type: 2,
				target_application_id: activityId
			}
		});

		return {
			activity: activity,
			invite: invite,
		};
	}

	/** @param {CommandInteraction} int */
	async slash(int){
		this.call(int).then(res => {
			int.reply({
				content: 'Приглашение создано, нажмите на кнопку ниже чтобы присоединиться к ' + res.activity.name,
				components: [{
					type: 1,
					components: [{
						type: 2,
						style: 5,
						url: 'https://discord.gg/' + res.invite.code,
						label: 'Присоединиться'
					}]
				}]
			})
		}).catch(error => {
			int.reply({
				content: reaction.emoji.error + ' ' + int.str(error),
				ephemeral: true
			});
		});
	};

	/** @param {AutocompleteInteraction} int */
	async autocomplete(int){
		await int.respond(this.#cache.toSortedChoices(int.options.getFocused()));

		if(this.#lastUpdate + 1000*60*60 < Date.now()){
			await this.updateActivities();
		}
	}

	/**
	 * Обновление списка активностей
	 */
	async updateActivities(){
		let data = [];

		try{
			data = await (await fetch('https://derpystuff.gitlab.io/webstorage/discord/activities/ids.json')).json();
		}catch(e){}

		this.#cache = [];
		this.#lastUpdate = Date.now();

		for(const key in data){
			this.#cache.push({
				name: key,
				value: data[key]
			});
		}
	}
}

module.exports = Activities;
