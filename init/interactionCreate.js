/**
 * Инициализирует прослушку взаимодействия с ботом
 */
module.exports = async () => {
    console.time('Event interactionCreate');
    client.on('interactionCreate', async int => {
        const name = int.commandName ?? int.customId.split('|')[0];

        if(!commands[name] || !commands[name].active) return;

        if(!int.indexFunc || !commands[name][int.indexFunc]) return;

        try{
            await commands[name][int.indexFunc](int);
        }catch(e){
            errorHandler(e, name, true);
        }
    });
    console.timeEnd('Event interactionCreate');
}