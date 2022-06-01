const fetch = require('node-fetch');
const { title } = require('./about.json');

const initFunctions = require('./initFunctions');

module.exports = {

	active : true,
	category : 'Утилиты',

	name : 'handler',
	title : title,

	init : async function(path){

		await this.siteStatusCheck();
		if(!this.siteStatus) log.initText += log.error(path + ': Сайт недоступен');

		this.functions = await initFunctions(path);

		client.on('messageCreate', async msg => {
			if(msg.channel.type == 'DM') return;
			if(msg.channel.guild.id != config.home) return;

			await this.call(msg);
		});

		return this;
	},


	/**
	 * Проверяет статус сайта и возвращает результат
	 * @return {Boolean}
	 */
	siteStatusCheck: async function(){
		const response = await fetch('https://igc.su', { redirect: 'manual' });

		return this.siteStatus = response.status == '200' ? true : false;
	},

	/**
	 * Обработка сообщения, которое не является командой
	 * @param {Message} msg Сообщение пользователя
	 */
	call: async function(msg){

		for(let command of this.commands) this.commandMessage(commands[command], msg);

		this.functionMessage('all', msg);

		const id = msg.channel.isThread() ? msg.channel.parentId : msg.channel.id;
		this.functionMessage(id, msg);

	},


	commandMessage: async function(command, msg){
		if(command.active) command.message(msg);
	},


	functionMessage: async function(channel, msg){
		if(!this.functions[channel]) return;
		for(let name in this.functions[channel]){
			try{
				await this.functions[channel][name](msg);
			}catch(e){
				const active = errorHandler(e, 'handler/func/' + channel + '/' + name, true);
				if(!active) delete this.functions[channel][name];
			}
		}
	}

};
