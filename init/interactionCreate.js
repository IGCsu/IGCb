/**
 * Инициализирует прослушку взаимодействия с ботом
 */
module.exports = async () => {
	console.time('Event interactionCreate');
	client.on('interactionCreate', async int => {
		const name = int.commandName ?? int.customId.split('|')[0];

		if(!commands[name]) return;


		if(client.paused && name !== 'sudo') {
			if (int.isAutocomplete()) return int.reply({choices: [{name: `Бот приостановлен`, value: 1}]});
			return int.reply({content: reaction.emoji.error + ` Бот приостановлен`, ephemeral: true});
		}

		if(!commands[name].active) {
			if (int.isAutocomplete()) return int.reply({choices: [{name: `Модуль ${name} оффлайн`, value: 1}]});
			return int.reply({content: reaction.emoji.error + ` Модуль ${name} оффлайн`, ephemeral: true});
		}

        if(!int.indexFunc || !commands[name][int.indexFunc]) return;

        try{
            await commands[name][int.indexFunc](int);
        }catch(e){
            e.handler(name, true);
        }

		int.action = getInteractionAction(int);

		if(!int.action || !commands[name][int.action]) return;

		try{
			await commands[name][int.action](int);
		}catch(e){
			errorHandler(e, name, true);
		}
	});
	console.timeEnd('Event interactionCreate');
}