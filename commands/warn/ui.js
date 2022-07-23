const {Modal, MessageEmbed, CommandInteraction, ButtonInteraction, ModalSubmitInteraction, Snowflake} = require("discord.js");
require('./Warn');
const {getCompactWarnCase} = require("./ui");

module.exports = {

    /**
     * Конструктор модального окна создания нового Варна
     * @param  {CommandInteraction} int
     * @param  {Snowflake}          targetId
     * @return {Modal}
     */
    newWarnModal: function (int, targetId){
        return new Modal({title: 'Новый варн', custom_id:`warn|NewWarnModal|${targetId}`,
            components:[{
                type: 1,
                components:[{
                    type: 4,
                    style: 2,
                    custom_id: 'reason',
                    label: 'Причина',
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
        return new Modal({title: 'Изменение варна №' + warn.case, custom_id:`warn|EditWarnModal|${warn.case}`,
            components:[{
                type: 1,
                components:[{
                    type: 4,
                    style: 2,
                    custom_id: 'reason',
                    label: 'Причина',
                    required: false,
                    value: warn.reason,
                    placeholder: '1.2, 1.10'
                }]
            }]
        });
    },
    /**
     * Конструктор эмбида для одиночного варна
     * @param  {CommandInteraction} int
     * @param  {Warn}               warn
     * @return {MessageEmbed}
     */
    getSingleWarnEmbed: async function (int, warn){
        const embed = new MessageEmbed({title: 'Варн' + (warn.flags.removed ? ' (Снят)': ''), color: (warn.flags.removed ? 0x808080 : reaction.color.warning)});
        embed.addField('Пользователь', (await warn.target).tag);
        embed.addField('Причина', warn.reason);
        embed.addField('Тип', warn.type);
        embed.setAuthor({name: (await warn.author).tag, iconURL: (await warn.author).avatarURL()});
        embed.setTimestamp(warn.date);
        embed.setThumbnail((await warn.target).avatarURL());
        embed.setFooter({text: 'ID: ' + warn.case});
        return {embeds: [embed], components:[{
                type: 1,
                components: [
                    {
                        type: 2,
                        style: 2,
                        custom_id: 'warn|embedEditReason|' + warn.case,
                        label: 'Изменить причину',
                        disabled: warn.flags.removed
                    },
                    {
                        type: 2,
                        style: warn.flags.removed ? 3 : 4,
                        custom_id: (warn.flags.removed ? 'warn|embedAddWarn|' : 'warn|embedRemoveWarn|') + warn.case,
                        label: warn.flags.removed ? 'Вернуть варн' : 'Снять варн'
                    }
            ]}]
        };
    },

    /**
     * Конструктор эмбида для списка варнов
     * @param  {CommandInteraction} int
     * @param  {Array<Warn>}        warns
     * @param  {string}             page
     * @param  {User}               target
     * @return {MessageEmbed}
     */
    getListWarnEmbed: async function (int, warns, target, page = '1/5'){
        const embed = new MessageEmbed({title: 'Список варнов', color: reaction.color.warning});

        let description = '';
        for(let i of warns){
            description += this.getCompactWarnCase(i) + '\n';
        }

        embed.setDescription(description);
        embed.setAuthor({name: int.user.tag, iconURL: int.user.avatarURL()});
        embed.setTimestamp(int.createdTimestamp);
        embed.setThumbnail(target.avatarURL());
        embed.setFooter({text: 'Страница: ' + page});
        return {embeds: [embed], components:[{
                type: 1,
                components: [
                    {
                        type: 2,
                        style: 1,
                        custom_id: `warn|embedPrevious|${target.id}|${page}`,
                        label: 'Предыдущая',
                        disabled: page.split('/')[0] === '1'
                    },
                    {
                        type: 2,
                        style: 1,
                        custom_id: `warn|embedNext|${target.id}|${page}`,
                        label: 'Следующяя',
                        disabled: page.split('/')[0] === page.split('/')[1]
                    },
                ]

            }]};

    },
    /**
     *
     * @param {ModalSubmitInteraction}  int
     * @param {Warn}                    warn
     * @param {boolean}                 ephemeral
     */
    newWarnEmbed: async function (int, warn, ephemeral=false) {
        const embed = new MessageEmbed({
            title: `${reaction.emoji.success} | Варн номер ${warn.case} был выдан пользователю ${(await warn.target).tag}`,
            color: reaction.color.success
        })
        return {embeds: [embed], ephemeral: ephemeral}
    },

    /**
     *
     * @param {ModalSubmitInteraction}  int
     * @param {Warn}                    warn
     * @param {boolean}                 ephemeral
     */
    editWarnEmbed: async function (int, warn, ephemeral=false) {
        const embed = new MessageEmbed({
            title: `${reaction.emoji.success} | Причина варна номер ${warn.case} была изменина на: ${warn.reason}`,
            color: reaction.color.success
        })
        return {embeds: [embed], ephemeral: ephemeral}
    },

    /**
     *
     * @param {ModalSubmitInteraction}  int
     * @param {Warn}                    warn
     * @param {boolean}                 ephemeral
     */
    removeWarnEmbed: async function (int, warn, ephemeral=false) {
        const embed = new MessageEmbed({
            title: `${reaction.emoji.success} | Варн номер ${warn.case} был снят с пользователя ${(await warn.target).tag}`,
            color: reaction.color.success
        })
        return {embeds: [embed], ephemeral: ephemeral}
    },

    noWarnsEmbed: function (ephemeral=false) {
        const embed = new MessageEmbed({
            title: 'У этого пользователя отсутствуют варны',
            color: reaction.color.blurple
        })
        return {embeds: [embed], ephemeral: ephemeral}
    },

    noSuchWarnEmbed: function (ephemeral=false) {
        const embed = new MessageEmbed({
            title: 'Такого варна не существует',
            color: reaction.color.blurple
        })
        return {embeds: [embed], ephemeral: ephemeral}
    },

    /**
     * Конструктор скоращённой строки-списка варнов
     * @param  {Warn}   warn
     * @return {string}
     */
    getCompactWarnCase : function (warn){
        const caseShifting = 3;
        return `\`${warn.case + ' '.repeat(caseShifting - String(warn.case).length)}\`: ${truncate(warn.reason, 10)} от <@${(warn.authorId)}>| <t:${Math.floor(warn.date/1000)}:R>`
    }
}