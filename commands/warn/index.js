const slashOptions = require('./slashOptions.json');
const { title, description } = require('./about.json');
const ui =  require('./ui.js');
const Warn =  require('./Warn.js');
const WarnsManager =  require('./WarnsManager.js');

module.exports = {

    active : true,
    category : 'Модерация',

    name : 'warn',
    title : title,
    description : description,
    slashOptions : slashOptions,

    testWarn1 : new Warn(1, 'direct', '256114365894230018', 'Кошара', '500020124515041283', undefined, new Date(), 0),
    testWarn2 : new Warn(2, 'direct', '500020124515041283', 'Пидор','256114365894230018' , undefined, new Date(), 0),

    warnsManager: new WarnsManager(),

    init : function(){ return this; },

    slash : async function(int){

        if(int.options.getSubcommand() === 'add')
            return await int.showModal(ui.newWarnModal(int, int.options.getUser('user').id))

        if(int.options.getSubcommandGroup() === 'get') {

            if(int.options.getSubcommand() === 'direct'){

                const warn = this.warnsManager.fetch(int.options.getInteger('case'));
                console.log(warn);
                let msg = ui.noSuchWarnEmbed();
                if (warn)
                    msg = await ui.getSingleWarnEmbed(int, warn);

                return await int.reply(msg);
            }

            if(int.options.getSubcommand() === 'last'){

                const warn = this.warnsManager.fetchLast(int.options.getUser('user', false)?.id);

                let msg = ui.noWarnsEmbed();
                if (warn)
                    msg = await ui.getSingleWarnEmbed(int, warn);

                return await int.reply(msg);
            }

            if(int.options.getSubcommand() === 'list'){

                return await int.reply(await ui.getListWarnEmbed(int, [this.testWarn1, this.testWarn2], int.options.getUser('user')));
            }
        }

        await int.reply({content: reaction.emoji.error + ' ' + localize(int.locale, 'In development'), ephemeral: true});
    },

    button: async function(int){
        let customId = int.customId.split('|');
        if(customId[1] === 'embedEditReason'){
            const warn = this.warnsManager.fetch(customId[2]);
            return await int.showModal(ui.editWarnModal(int, warn));
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
            const warn = this.warnsManager.fetch(customId[2]);
            warn.flags = {removed: true};
            this.warnsManager.update(warn);
            await int.update(await ui.getSingleWarnEmbed(int, warn));
            return int.followUp(await ui.removeWarnEmbed(int, warn, true));
        }

        if(customId[1] === 'embedAddWarn'){
            const warn = this.warnsManager.fetch(customId[2]);
            warn.flags = {removed: false};
            this.warnsManager.update(warn);
            await int.update(await ui.getSingleWarnEmbed(int, warn));
            return int.followUp(await ui.newWarnEmbed(int, warn, true));
        }

        await int.reply({content: reaction.emoji.error + ' ' + localize(int.locale, 'In development'), ephemeral: true});
    },

    modal : async function(int){
        let customId = int.customId.split('|');
        const reason = int.fields.getField('reason').value

        if(customId[1] === 'NewWarnModal'){
            const warn = this.warnsManager.create(customId[2], reason, int.user.id);
            return await int.reply(await ui.newWarnEmbed(int, warn));
        }

        if(customId[1] === 'EditWarnModal'){

            const warn = this.warnsManager.fetch(customId[2]);
            warn.reason = reason;
            this.warnsManager.update(warn);

            await int.update(await ui.getSingleWarnEmbed(int, warn))
            return await int.followUp(await ui.editWarnEmbed(int, warn, true));
        }

        await int.reply({content: reaction.emoji.error + ' ' + localize(int.locale, 'In development'), ephemeral: true});
    },
};