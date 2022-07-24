const Warn = require('./Warn.js')
const {Snowflake} = require('discord.js')

class WarnManager {

    /**
     *
     * @type {number}
     */
    #lastCase = 0;

    /**
     *
     * @return {number}
     */
    get lastCase(){
        return this.#lastCase;
    };

    constructor() {
        this.#lastCase = DB.query('SELECT MAX(case_id) FROM warns')[0]['MAX(case_id)'];
    };

    /**
     * @param   {number} caseId
     * @return  {Warn}
     */
    fetch(caseId){
        const rawData = DB.query('SELECT * FROM warns WHERE case_id = ?', [caseId])?.[0]
        if(rawData === undefined) return undefined;

        const warn = new Warn();
        return warn.resolveFromObject(rawData);
    };

    /**
     * @param   {Snowflake} targetID
     * @return  {Warn}
     */
    fetchLast(targetID){
        const expression = targetID ? `SELECT * FROM warns WHERE case_id = (SELECT MAX(case_id) FROM warns WHERE target_id = ${targetID})`: 'SELECT * FROM warns WHERE case_id = (SELECT MAX(case_id) FROM warns)'
        const rawData = DB.query(expression)?.[0]
        if(rawData === undefined) return undefined;

        const warn = new Warn();
        return warn.resolveFromObject(rawData);
    };

    /**
     * @param   {Snowflake} targetID
     * @return  {Warn[]}
     */
    fetchAll(targetID){
        const expression = targetID ? `SELECT * FROM warns WHERE target_id = ${targetID}`: 'SELECT * FROM warns'

        const rawData = DB.query(expression);
        if(rawData === undefined) return undefined;

        let warns = [];
        for (let warnRow of rawData){
            const warn = new Warn();
            warn.resolveFromObject(warnRow);
            if(!warn.flags.removed)
                warns.push(warn);
        }
        warns.reverse()

        return warns;
    };

    /**
     * @param   {Snowflake} authorId
     * @param   {string}    type
     * @param   {Snowflake} targetId
     * @param   {string}    reason
     * @param   {Object}    flags
     * @param   {Snowflake} referenceId
     * @return  {Warn}
     */
    create(targetId, reason, authorId, flags= undefined, type = 'direct', referenceId=undefined){
        this.#lastCase = this.lastCase + 1;
        const warn = new Warn(this.lastCase, type, targetId, reason, authorId, referenceId, new Date(), flags);
        DB.query('INSERT IGNORE INTO warns VALUES (?, ?, ?, ?, ?, ?, ?, ?)', warn.toRawArray())?.[0]
        return warn;
    };

    /**
     * @param   {Warn} warn
     * @return  {boolean}
     */
    update(warn){
        DB.query('UPDATE warns SET reason = ?, flags = ? WHERE case_id = ?', [warn.reason, warn.flagsRaw, warn.case])?.[0]
        return true;
    };
}

module.exports = WarnManager;