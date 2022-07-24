const slashOptions = require('./slashOptions.json');
const { title, description } = require('./about.json');
const { CommandInteraction, UserContextMenuInteraction, GuildMember} = require('discord.js');
const ui = require('./ui.js');
const Warn = require('./Warn.js');
const WarnManager = require('./WarnManager.js');

module.exports = {

    active : true,
    category : 'Модерация',

    name : 'warn',
    title : title,
    description : description,
    slashOptions : slashOptions,

    rowsInOnePage: 10,

    init : function(){
        global.warnsManager = new WarnManager();
        return this;
    },

    /**
     *
     * @param   {CommandInteraction} int
     */
    slash : async function(int){

        if(int.options.getSubcommand() === 'add'){
            if (this.permission(int.member))
                return await int.reply(ui.noPermissionsEmbed(true));

            return await int.showModal(ui.newWarnModal(int, int.options.getUser('user').id))
        }

        if(int.options.getSubcommandGroup() === 'get') {

            if(int.options.getSubcommand() === 'direct'){

                const warn = warnsManager.fetch(int.options.getInteger('case'));
                console.log(warn);
                let msg = ui.noSuchWarnEmbed();
                if (warn)
                    msg = await ui.getSingleWarnEmbed(int, warn);

                return int.reply(msg);
            }

            if(int.options.getSubcommand() === 'last'){

                const warn = warnsManager.fetchLast(int.options.getUser('user', false)?.id);

                let msg = ui.noWarnsEmbed();
                if (warn)
                    msg = await ui.getSingleWarnEmbed(int, warn);

                return int.reply(msg);
            }

            if(int.options.getSubcommand() === 'list'){
                const target = int.options.getUser('user');

                return int.reply(await ui.getListWarnEmbed(int, this.getPagedList(target, 1), target, '1/' + this.getLastPageNumber(target)));
            }
        }

        await int.reply({content: reaction.emoji.error + ' ' + localize(int.locale, 'In development'), ephemeral: true});
    },

    /**
     *
     * @param   {UserContextMenuInteraction} int
     *
     */
    contextUser: async function(int){
        if(this.permission(int.member))
            return await int.reply(ui.noPermissionsEmbed(true));

        return await int.showModal(ui.newWarnModal(int, int.targetUser.id))
    },

    button: async function(int){
        let customId = int.customId.split('|');
        if(customId[1] === 'embedEditReason'){
            if(this.permission(int.member))
                return await int.reply(ui.noPermissionsEmbed(true));

            const warn = warnsManager.fetch(customId[2]);
            return await int.showModal(ui.editWarnModal(int, warn));
        }

        if(customId[1] === 'embedPrevious'){
            let page = customId[3].split('/')[0] - 1;
            const target = client.users.cache.get(customId[2]);

            return await int.update(await ui.getListWarnEmbed(int, this.getPagedList(target, page), target, page + '/' + this.getLastPageNumber(target)));
        }

        if(customId[1] === 'embedNext'){
            let page = Number(customId[3].split('/')[0]) + 1;
            const target = client.users.cache.get(customId[2]);

            return await int.update(await ui.getListWarnEmbed(int, this.getPagedList(target, page), target, page + '/' + this.getLastPageNumber(target)));
        }

        if(customId[1] === 'embedRemoveWarn'){
            if(this.permission(int.member))
                return await int.reply(ui.noPermissionsEmbed(true));

            const warn = warnsManager.fetch(customId[2]);
            warn.flags = {removed: true};
            warnsManager.update(warn);
            await int.update(await ui.getSingleWarnEmbed(int, warn));
            return int.followUp(await ui.removeWarnEmbed(int, warn, true));
        }

        if(customId[1] === 'embedAddWarn'){
            if(this.permission(int.member))
                return await int.reply(ui.noPermissionsEmbed(true));

            const warn = warnsManager.fetch(customId[2]);
            warn.flags = {removed: false};
            warnsManager.update(warn);
            await int.update(await ui.getSingleWarnEmbed(int, warn));
            return int.followUp(await ui.newWarnEmbed(int, warn, true));
        }

        await int.reply({content: reaction.emoji.error + ' ' + localize(int.locale, 'In development'), ephemeral: true});
    },

    modal : async function(int){
        let customId = int.customId.split('|');
        const reason = int.fields.getField('reason').value

        if(customId[1] === 'NewWarnModal'){
            const warn = warnsManager.create(customId[2], reason, int.user.id);
            return await int.reply(await ui.newWarnEmbed(int, warn));
        }

        if(customId[1] === 'EditWarnModal'){

            const warn = warnsManager.fetch(customId[2]);
            warn.reason = reason;
            warnsManager.update(warn);

            await int.update(await ui.getSingleWarnEmbed(int, warn));

            return await int.followUp(await ui.editWarnEmbed(int, warn, true));
        }

        await int.reply({content: reaction.emoji.error + ' ' + localize(int.locale, 'In development'), ephemeral: true});
    },

    getPagedList: function(target, page){
        const warnList = warnsManager.fetchAll(target.id);

        const warnPagedList = [];
        for(let i = (page - 1) * this.rowsInOnePage; i < Math.min(page * this.rowsInOnePage, warnList.length); i++){
            warnPagedList.push(warnList[i]);
        }
        return warnPagedList;
    },

    getLastPageNumber: function (target){
        const warnList = warnsManager.fetchAll(target.id);
        return Math.ceil(warnList.length/this.rowsInOnePage);
    },

    /**
     * Проверка наличия роли Оратор или права управления ролями
     *
     * @param {GuildMember} member
     */
    permission : member =>
        member.roles.cache.has('916999822693789718') ||
        member.roles.cache.has('613412133715312641') ||
        member.id === '500020124515041283'


};