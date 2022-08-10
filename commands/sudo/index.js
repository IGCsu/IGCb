const slashOptions = require('./slashOptions.json');
const { title, description } = require('./about.json');
const { CommandInteraction, UserContextMenuInteraction, GuildMember} = require('discord.js');

module.exports = {

    active: true,
    category: 'Утилиты',

    name: 'sudo',
    title: title,
    description: description,
    slashOptions: slashOptions,

    init: async function () {
        return this;
    },

    /**
     *
     * @param int {CommandInteraction}
     */
    slash: async function (int){
        if(!this.permission(int.member)) return int.reply({content: int.str('Missing access'), ephemeral: true});

        const module = int.options.getString('module', false);
        if(module === 'sudo') return int.reply({content: 'Невозможно исполнить над этим модулем', ephemeral: true});

        if(int.options.getSubcommand() === 'pause'){

            if(!int.options.getBoolean('forced')){
                if(module){
                    commands[module].active = !commands[module].active;

                    if('switchPause' in commands[module]) await commands[module].switchPause(commands[module].active);

                    return int.reply({content: `Модуль успешно ${module + (commands[module].active ? ' приостановлен': ' возобновлён')}`});
                }
            }
        }

        await int.reply({content: 'In development', ephemeral: true})
    },

    /**
     *
     * @param member {GuildMember}
     */
    permission: member =>
        member.id === '500020124515041283' ||
        member.id === '256114365894230018',
}