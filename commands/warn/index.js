const slashOptions = require('./slashOptions.json');
const { title, description } = require('./about.json');
const ui =  require('./ui.js');

module.exports = {

    active : true,
    category : 'Модерация',

    name : 'warn',
    title : title,
    description : description,
    slashOptions : slashOptions,

    init : function(){ return this; },

    slash : async function(int){

        if(int.options.getSubcommand() === 'add') return await int.showModal(ui.NewWarnModal(int, int.options.getUser('user').id))

        if(int.options.getSubcommandGroup() === 'get') {
            if(int.options.getSubcommand() === 'direct')
                return await int.reply(ui.GetDirectWarnEmbed(int, int.options.getString('case')));
            if(int.options.getSubcommand() === 'last')
                return await int.reply(ui.GetLastWarnEmbed(int, int.options.getUser('user')));
            if(int.options.getSubcommand() === 'list')
                return await int.reply(ui.GetListWarnEmbed(int, int.options.getUser('user')));
        }


        await int.reply({content: reaction.emoji.error + ' ' + localize(int.locale, 'In development'), ephemeral: true});
    },

    button: async function(int){
        await int.reply({content: reaction.emoji.error + ' ' + localize(int.locale, 'In development'), ephemeral: true});
    },

    modal : async function(int){
        await int.reply({content: reaction.emoji.error + ' ' + localize(int.locale, 'In development'), ephemeral: true});
    },
};