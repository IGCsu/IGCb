/**
 * Инициализирует прослушку взаимодействия с ботом
 */
module.exports = async () => {
    console.time('Event interactionCreate');
    client.on('interactionCreate', async int => {
        const name = int.commandName ?? int.customId.split('|')[0];

        if(!commands[name]) return;

        if(client.paused && name !== 'sudo') return;

        if(!commands[name].active) return int.reply({content: `Модуль ${name} оффлайн`, ephemeral: true});

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