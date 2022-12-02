const { User, Message, Snowflake, BitField } = require('discord.js');
const bitFields = require('./bitFields.json');
const WarnPagination = require('./WarnPagination');
const EmbedBuilder = require('./EmbedBuilder');

class Warn {

	/**
	 * ID варна
	 * @type {number}
	 */
	get id () {
		return this.#id;
	}

	#id;

	/**
	 * Тип варна
	 * @type {string}
	 */
	get type () {
		return Object.keys(bitFields.types)
			.find(key => bitFields.types[key] === this.#type);
	}

	#type;

	/**
	 * ID участника получившего варн
	 * @type {Snowflake}
	 */
	get targetId () {
		return this.#targetId;
	}

	/**
	 * Возвращает пользователя получивший варн
	 * @type {Promise<User>}
	 */
	getTarget () {
		return client.users.fetch(this.#targetId);
	}

	#targetId;

	/**
	 * ID автор варна
	 * @type {Snowflake}
	 */
	get authorId () {
		return this.#authorId;
	}

	/**
	 * Возвращает автора варна
	 * @type {Promise<User>}
	 */
	getAuthor () {
		return client.users.fetch(this.#authorId);
	}

	#authorId;

	// /**
	//  * ID референс(???) варна.
	//  * @type {Snowflake}
	//  */
	// get referenceId(){
	// 	return this.#referenceId;
	// }
	//
	// /**
	//  * Референс варна.
	//  * @type {Promise<Message>}
	//  */
	// get reference(){
	// 	return this.#referenceId;
	// }
	//
	// #referenceId;

	/**
	 * Unixtime метка выдачи варна
	 * @type {number}
	 */
	#date;

	/**
	 * Временная метка выдачи варна
	 * @type {Date}
	 */
	get date () {
		return new Date(this.#date * 1000000);
	}

	/**
	 * Флаги в формате для хранения в БД
	 * @type {number}
	 */
	#flagsRaw = 0;

	get flagsRaw () {
		return this.#flagsRaw;
	}

	/**
	 * Объект содержащий пары ключ + bool значение
	 * @return {Object}
	 */
	get flags () {
		let flags = {};
		for (let flagEntry in bitFields.flags) {
			flags[flagEntry] = Boolean(this.#flagsRaw & bitFields.flags[flagEntry]);
		}
		return flags;
	}

	/**
	 * Объект содержащий пары ключ + bool значение
	 * @param flags {Object}
	 */
	set flags (flags) {
		let flagsObjectCurrent = {};
		for (let flagEntry in bitFields.flags) {
			flagsObjectCurrent[flagEntry] = Boolean(
				this.#flagsRaw & bitFields.flags[flagEntry]
			);
		}
		let flagsNumericTarget = 0;
		for (let flagEntry in flagsObjectCurrent) {
			if (bitFields.flags[flagEntry] === undefined) {
				throw new Error('Attempting to change an unknown flag');
			}
			flagsNumericTarget += ((flags[flagEntry] !== undefined)
				? bitFields.flags[flagEntry] * flags[flagEntry]
				: bitFields.flags[flagEntry] * flagsObjectCurrent[flagEntry]);
		}
		this.#flagsRaw = flagsNumericTarget;
	}

	/**
	 * Причина варна
	 * @type {string}
	 */
	reason;

	/**
	 * @param {Object} data
	 * @param {number} [data.id] ID варна
	 * @param {string|number} [data.type='direct'] Тип варна, принимает либо
	 *   текстовое значение типа, либо его номерное значение
	 * @param {Snowflake|string} data.target ID пользователя получившего варн
	 * @param {Snowflake|string} data.author ID пользователя выдавшего варн
	 * @param {Snowflake|string} [data.reference=null] ID сообщения на которое
	 *   ссылается варн
	 * @param {number} [data.date=Date.now()] Unixtime метка выдачи варна
	 * @param {number} [data.flags=0] Число выражающее все флаги варна
	 * @param {string} data.reason Причина варна
	 * @constructor
	 */
	constructor (data) {
		if (!data.type) data.type = 'direct';
		if (!data.date) data.date = Date.now();
		if (!data.flags) data.flags = 0;
		if (!data.reference) data.reference = null;

		this.#id = data.id;

		this.#type = typeof data.type == 'number'
			? data.type
			: bitFields.types[data.type];

		if (bitFields.types[this.type] === undefined) {
			throw new Error(`Attempting to set an unknown type: \"${data.type}\"`);
		}

		this.#targetId = data.target;
		this.#authorId = data.author;

		// TODO: Не имею ни малейшего представления, что такое "reference", зачем
		//  оно нужно и тп. Тыкай это сам, все упоминания задокументировал или
		//  закрыл заглушками через null this.#referenceId = referenceId?.message;
		// if(referenceId) this.#reference =
		// guild.channels.cache.get(referenceId?.channel)?.messages?.fetch(referenceId?.message);

		this.#date = Math.round(data.date / 1000);

		this.#flagsRaw = data.flags ?? 0;

		this.reason = data.reason;
	}

	/**
	 * Сохраняет модель в базу данных
	 */
	save () {

		// TODO: Не, не сохраняет модель в базу. Базы нет
// 		if (this.#id) {
// 			DB.query(
// 				'UPDATE warns SET reason = ?, flags = ? WHERE id = ?',
// 				[this.reason, this.flagsRaw, this.#id]
// 			);
// 		} else {
// 			DB.query(
// 				'INSERT INTO warns (type, target, reason, author, reference, date, flags) VALUES (?, ?, ?, ?, ?, ?, ?)',
// 				[
// 					this.#type,
// 					this.#targetId,
// 					this.reason,
// 					this.#authorId,
// 					null,
// 					this.#date,
// 					this.flagsRaw
// 				]
// 			);
// 			this.#id = DB.query('SELECT MAX(id) as max FROM warns')[0].max;
// 		}

		return this;
	}

	/**
	 * Возвращает строку варна
	 * @return {string}
	 */
	toString () {
		// const reasonShifting 	= 15;
		// const caseShifting 		= 3;
		// const reason = this.reason.replace(/\n/gm, '')
		// return `\`${str2targetLength(String(this.id), caseShifting, 0)}:`
		// 	+ ` ${str2targetLength(reason ?? 'Не указана', reasonShifting, 1)}`
		// 	+ ` от\` <@${(this.authorId)}> |`
		// 	+ ` <t:${Math.floor(this.#date)}:R>`

		let str = this.#id + ': <@' + this.authorId + '> <t:' +
			Math.floor(this.#date) + ':R>';

		if (this.reason) {
			str += '\n Причина: *' + this.reason.trim() + '*';
		}

		str += '\n';

		return str;
	}

	/**
	 * Возвращает эмбед варна
	 * @param {CommandInteraction|ButtonInteraction|ModalSubmitInteraction} int
	 * @return {Object<InteractionReplyOptions>}
	 */
	async getEmbed (int) {
		return EmbedBuilder.showWarn(int, this);
	}

	/**
	 * Возвращает варн по ID
	 * @param {number|string} id
	 * @return {Warn}
	 */
	static get (id) {
// 		const data = DB.query('SELECT * FROM warns WHERE id = ?', [id]);
// 		if (!data[0]) return undefined;
		return undefined;

		return new this(data[0]);
	}

	/**
	 * Возвращает последний варн. Если указать ID пользователя - выборка будет
	 * только по указанному пользователю
	 * @param {Snowflake|string} [target] ID пользователя
	 * @return {Warn}
	 */
	static last (target) {
// 		const query = target
// 			? `SELECT * FROM warns WHERE id = (SELECT MAX(id) FROM warns WHERE target = ${target})`
// 			: `SELECT * FROM warns WHERE id = (SELECT MAX(id) FROM warns)`;
// 		const data = DB.query(query);
// 		if (!data[0]) return undefined;
		return undefined;

		return new this(data[0]);
	}

	/**
	 * Возвращает все варны. Если указать ID пользователя - выборка будет только
	 * по указанному пользователю
	 * @param {Snowflake|string} [target] ID пользователя
	 * @return {Warn[]}
	 */
	static all (target) {
// 		const query = target
// 			? `SELECT * FROM warns WHERE NOT flags & 4 AND target = ${target}`
// 			: `SELECT * FROM warns WHERE NOT flags & 4`;
// 		const data = DB.query(query);
		return [];

		let warns = [];
		for (let i = data.length; i >= 0; i--) {
			warns.push(new this(data[i]));
		}

		return warns;
	}

	/**
	 * Возвращает пагинацию варнов. Если указать ID пользователя - выборка будет
	 * только по указанному пользователю
	 * @param {User} [target] ID пользователя
	 * @param {number|string} [pageNumber=1] Текущая страница
	 * @param {number|string} [pageCount=10] Кол-во записей на одной странице
	 * @return {WarnPagination}
	 */
	static pagination (target, pageNumber, pageCount) {
		return new WarnPagination(this, target, pageNumber, pageCount);
	}

	/**
	 * Создаёт варн
	 * @param {Object} data
	 * @param {string|number} [data.type='direct'] Тип варна, принимает либо
	 *   текстовое значение типа, либо его номерное значение
	 * @param {Snowflake|string} data.target ID пользователя получившего варн
	 * @param {Snowflake|string} data.author ID пользователя выдавшего варн
	 * @param {Snowflake|string} [data.reference=null] ID сообщения на которое
	 *   ссылается варн
	 * @param {number} [data.date=Date.now()] Unixtime метка выдачи варна
	 * @param {number} [data.flags=0] Число выражающее все флаги варна
	 * @param {string} data.reason Причина варна
	 * @return {Warn} Созданный варн
	 */
	static create (data) {
		const warn = new this(data);
		return warn.save();
	}

}

module.exports = Warn;
