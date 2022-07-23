const {User, Message, Snowflake} = require('discord.js')
const bitFields = require('./BitFields.json')

class Warn {

    /**
     * Фактический ID класса Warn
     * @type {Number}
     */
    #caseId = -1;

    /**
     * ReadOnly свойство возвращающее ID варна
     * @return {Number}
     */
    get case() {
        return this.#caseId;
    }

    /**
     * Тип варна в форме пригодной для БД
     * @type {Number}
     */
    #typeRaw = 0;

    /**
     * Тип варна в форме пригодной для БД
     * @return {String}
     */
    get type(){
        return Object.keys(bitFields.types).find(key => bitFields.types[key] === this.#typeRaw);
    }

    /**
     * Свойство ID цели варна.
     * @type {Snowflake}
     */
    #targetId = undefined;

    get targetId(){
        return this.#targetId;
    }

    /**
     * Свойство цели варна.
     * @type {Promise<User>}
     */
    target = undefined;

    /**
     * Свойство причины варна
     * @type {string}
     */
    reason = undefined;

    /**
     * Свойство ID автора варна.
     * @type {Snowflake}
     */
    #authorId = undefined;

    get authorId(){
        return this.#authorId;
    }

    /**
     * Свойство автора варна.
     * @type {Promise<User>}
     */
    author = undefined;

    /**
     * Свойство ID референса варна.
     * @type {Snowflake}
     */
    #referenceId = undefined;

    get referenceId(){
        return this.#referenceId;
    }

    /**
     * Свойство референса варна.
     * @type {Promise<Message>}
     */
    reference = undefined;

    /**
     * Количество секунд прошедших с 1970.01.01 00:00
     * @type {Number}
     */
    #dateRaw = undefined;

    /**
     * Класс Date обозначающий время варна
     * @return {Date}
     */
    get date() {
        return new Date(this.#dateRaw * 1000);
    };

    /**
     * Флаги в формате для храннения в БД
     * @type {Number}
     */
    #flagsRaw = 0

    /**
     * Обект содержащий пары ключ + bool значение
     * @return {Object}
     */
    get flags() {
        let flags = {};
        for(let flagEntry in bitFields.flags){
            flags[flagEntry] = Boolean(this.#flagsRaw & bitFields.flags[flagEntry]);
        }
        return flags;


    };

    /**
     * Обект содержащий пары ключ + bool значение
     * @param flags {Object}
     */
    set flags(flags) {
        let flagsObjectCurrent = {};
        for(let flagEntry in bitFields.flags){
            flagsObjectCurrent[flagEntry] = Boolean(this.#flagsRaw & bitFields.flags[flagEntry]);
        }
        let flagsNumericTarget = 0;
        for(let flagEntry in flagsObjectCurrent){
            if(bitFields.flags[flagEntry] === undefined)
                throw new Error('Attempting to change an unknown flag');
            flagsNumericTarget += ((flags[flagEntry] !== undefined) ? bitFields.flags[flagEntry] * flags[flagEntry] : bitFields.flags[flagEntry] * flagsObjectCurrent[flagEntry]);
        }
        this.#flagsRaw = flagsNumericTarget;
    };

    /**
     * Тип данных Warn.
     * @param  {Number}      caseId         ID варна
     * @param  {String}      type           Тип варна
     * @param  {Snowflake}   targetId       ID цели варна (ID пользователя получившего варн).
     * @param  {String}      reason         Причина варна
     * @param  {Snowflake}   authorId       ID автора варна (ID пользователя выдавшего варн).
     * @param  {Object}      referenceId    ID сообщения на которое ссылвется варн.
     * @param  {Date}        date           Время выдачи выарна
     * @param  {Number}      flagsRaw       Число выражающее все флаги варна
     *
     * @return {Object}                     Объект Warn
     */
    constructor(caseId, type, targetId, reason, authorId, referenceId, date, flagsRaw) {
        this.#caseId = caseId;

        if(bitFields.types[type] === undefined)
            throw new Error(`Attempting to set an unknown type: \"${type}\"`);
        this.#typeRaw = bitFields.types[type]

        this.#targetId = targetId;
        this.target = client.users.fetch(targetId);

        this.reason = reason;

        this.#authorId = authorId;
        this.author = client.users.fetch(authorId);

        this.#referenceId = referenceId?.message;
        if(referenceId)
            this.reference = guild.channels.cache.get(referenceId?.channel)?.messages?.fetch(referenceId?.message);

        this.#dateRaw = Math.floor(date.getTime()/1000);
        this.#flagsRaw = flagsRaw ?? 0;
    }
}

module.exports = Warn;