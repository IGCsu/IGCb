const {Modal, MessageEmbed, CommandInteraction, ButtonInteraction, ModalSubmitInteraction} = require("discord.js");
require('./Warn');

module.exports = {

    /**
     * Конструктор модального окна создания нового Варна
     * @param  {CommandInteraction} int
     * @param  {Warn}               warn
     * @return {Modal}
     */
    newWarnModal: function (int, warn){
        return new Modal({title: 'New warn', custom_id:`warn|NewWarnModal|${warn.targetId}`,
            components:[{
                type: 1,
                components:[{
                    type: 4,
                    style: 2,
                    custom_id: 'reason',
                    label: 'Reason',
                    required: false,
                    placeholder: '1.2, 1.10'
                }]
            }]
        });
    },
    /**
     * Конструктор модального окна изменения причины Варна
     * @param  {ButtonInteraction} int
     * @param  {Warn}               warn
     * @return {Modal}
     */
    editWarnModal: function (int, warn){
        return new Modal({title: 'Edit reason', custom_id:`warn|EditWarnModal|${warn.targetId}`,
            components:[{
                type: 1,
                components:[{
                    type: 4,
                    style: 2,
                    custom_id: 'reason',
                    label: 'Reason',
                    required: false,
                    value: warn.reason,
                    placeholder: '1.2, 1.10'
                }]
            }]
        });
    },
    /**
     * Конструктор модального окна изменения причины Варна
     * @param  {CommandInteraction} int
     * @param  {Warn}               warn
     * @return {MessageEmbed}
     */
    getDirectWarnEmbed: function (int, warn){
        const embed = new MessageEmbed({title: 'Warn', color: reaction.color.warning});
        embed.setDescription('reason text' /* warn.getReason() */);
        embed.setAuthor({name: int.user.username, iconURL: int.user.avatarURL()} /* warn.getAuthor() */);
        embed.setTimestamp(int.timestamp/* warn.getTimestamp() */);
        embed.setThumbnail(int.user.avatarURL()/* warn.getTarget().iconURL */);
        embed.setFooter({text: 'ID: ' + warn}/* warn.getCase() */);
        return {embeds: [embed], components:[{
                type: 1,
                components: [
                    {
                        type: 2,
                        style: 2,
                        custom_id: 'warn|embedEditReason',
                        label: 'Edit Reason'
                    },
                    {
                        type: 2,
                        style: 4,
                        custom_id: 'warn|embedRemoveWarn',
                        label: 'Remove Warn'
                    }
            ]}]
        };
    },
    getLastWarnEmbed: function (int, warn){
        const embed = new MessageEmbed({title: 'Warn', color: reaction.color.warning});
        embed.setDescription('reason text' /* warn.getReason() */);
        embed.setAuthor({name: int.user.username, iconURL: int.user.avatarURL()} /* warn.getAuthor() */);
        embed.setTimestamp(int.timestamp/* warn.getTimestamp() */);
        embed.setThumbnail(warn?.avatarURL() ?? int.user.avatarURL()/* warn.getTarget().iconURL */);
        embed.setFooter({text: 'ID: 1'}/* warn.getCase() */);
        return {embeds: [embed], components:[{
                type: 1,
                components: [
                    {
                        type: 2,
                        style: 2,
                        custom_id: 'warn|embedEditReason',
                        label: 'Edit Reason'
                    },
                    {
                        type: 2,
                        style: 4,
                        custom_id: 'warn|embedRemoveWarn',
                        label: 'Remove Warn'
                    }
                ]}]};
    },

    getListWarnEmbed: function (int, warn){
        const embed = new MessageEmbed({title: 'Warn', color: reaction.color.warning});
        embed.setDescription(
            `1: reason text by <@${int.user.id}> <t:${Math.floor(int.createdTimestamp/1000)}:R>` +
            '\n2: reason text by <@123456789109999> <t:0:R>' +
            '\n3: reason text by <@123456789109999> <t:0:R>' +
            '\n4: reason text by <@123456789109999> <t:0:R>' +
            '\n5: reason text by <@123456789109999> <t:0:R>' +
            '\n6: reason text by <@123456789109999> <t:0:R>' +
            '\n7: reason text by <@123456789109999> <t:0:R>' +
            '\n8: reason text by <@123456789109999> <t:0:R>' +
            '\n9: reason text by <@123456789109999> <t:0:R>' +
            '\n10: reason text by <@123456789109999> <t:0:R>' /* warn.getReason() */);
        embed.setAuthor({name: int.user.username, iconURL: int.user.avatarURL()} /* warn.getAuthor() */);
        embed.setTimestamp(int.createdTimestamp/* warn.getTimestamp() */);
        embed.setThumbnail(warn.avatarURL()/* warn.getTarget().iconURL */);
        embed.setFooter({text: 'Page: 1/5'}/* warn.getCase() */);
        return {embeds: [embed], components:[{
                type: 1,
                components: [
                    {
                        type: 2,
                        style: 1,
                        custom_id: 'warn|embedPrevious',
                        label: 'Previous'
                    },
                    {
                        type: 2,
                        style: 1,
                        custom_id: 'warn|embedNext',
                        label: 'Next'
                    },
                ]

            }]};

    },
}