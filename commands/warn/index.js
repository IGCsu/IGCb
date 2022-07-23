const slashOptions = require('./slashOptions.json');
const { title, description } = require('./about.json');
const ui =  require('./ui.js');
const Warn =  require('./Warn.js');

module.exports = {

    active : true,
    category : 'Модерация',

    name : 'warn',
    title : title,
    description : description,
    slashOptions : slashOptions,

    testWarn1 : new Warn(1, 'direct', '256114365894230018', 'Кошара', '500020124515041283', undefined, new Date(), 0),
    testWarn2 : new Warn(2, 'direct', '500020124515041283', 'Пидор','256114365894230018' , undefined, new Date(), 0),

    init : function(){ return this; },

    slash : async function(int){

        if(int.options.getSubcommand() === 'add')
            return await int.showModal(ui.newWarnModal(int, int.options.getUser('user').id))

        if(int.options.getSubcommandGroup() === 'get') {
            if(int.options.getSubcommand() === 'direct')
                return await int.reply(await ui.getSingleWarnEmbed(int, this.testWarn1));
            if(int.options.getSubcommand() === 'last')
                return await int.reply(await ui.getSingleWarnEmbed(int, this.testWarn2));
            if(int.options.getSubcommand() === 'list')
                return await int.reply(await ui.getListWarnEmbed(int, [this.testWarn1, this.testWarn2], int.options.getUser('user')));
        }


        await int.reply({content: reaction.emoji.error + ' ' + localize(int.locale, 'In development'), ephemeral: true});
    },

    button: async function(int){
        let customId = int.customId.split('|');
        if(customId[1] === 'embedEditReason'){
            return await int.showModal(ui.editWarnModal(int, this.testWarn1));
        }

        if(customId[1] === 'embedPrevious'){
            let page = customId[3].split('/')[0] - 1 + '/5';
            return await int.update(await ui.getListWarnEmbed(int, [this.testWarn1, this.testWarn2], client.users.cache.get(customId[2]), page));
        }

        if(customId[1] === 'embedNext'){
            let page = Number(customId[3].split('/')[0]) + 1 + '/5';
            return await int.update(await ui.getListWarnEmbed(int, [this.testWarn1, this.testWarn2], client.users.cache.get(customId[2]), page));
        }

        if(customId[1] === 'embedRemoveWarn'){
            this.testWarn1.flags = {removed: true};
            await int.update(await ui.getSingleWarnEmbed(int, this.testWarn1));
            return int.followUp(await ui.removeWarnEmbed(int, this.testWarn1, true));
        }

        if(customId[1] === 'embedAddWarn'){
            this.testWarn1.flags = {removed: false};
            await int.update(await ui.getSingleWarnEmbed(int, this.testWarn1));
            return int.followUp(await ui.newWarnEmbed(int, this.testWarn1, true));
        }

        await int.reply({content: reaction.emoji.error + ' ' + localize(int.locale, 'In development'), ephemeral: true});
    },

    modal : async function(int){
        let customId = int.customId.split('|');

        if(customId[1] === 'NewWarnModal'){
            return await int.reply(await ui.newWarnEmbed(int, this.testWarn1));
        }

        if(customId[1] === 'EditWarnModal'){
            this.testWarn1.reason = int.fields.getField('reason').value;
            await int.update(await ui.getSingleWarnEmbed(int, this.testWarn1))
            return await int.followUp(await ui.editWarnEmbed(int, this.testWarn1, true));
        }

        await int.reply({content: reaction.emoji.error + ' ' + localize(int.locale, 'In development'), ephemeral: true});
    },
};