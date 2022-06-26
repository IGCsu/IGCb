const flags = require('./gameData/flags.json');
const players = require('./gameData/players.json');
const statuses = require('./gameData/statuses.json');

const regexps = require('./gameData/regexps');

module.exports = class UserDiplomacy {

	/**
	 * ID игрока в дискорде
	 * @type {string}
	 */
	id;

	/**
	 * Необходимость пингануть юзера по причине отсутствия действий
	 * @type {boolean}
	 */
	primaryPing;

	/**
	 * Необходимость пингануть юзера по причине не готовности
	 * @type {boolean}
	 */
	secondPing;

	/**
	 * Эмодзи статуса игрока
	 * @type {Emoji}
	 */
	status;

	/**
	 * Флаг страны игрока
	 * @type {Emoji}
	 */
	flag;

	/**
	 * Тег страны игрока
	 * @type {string}
	 */
	tag;

	/**
	 * Кол-во ресурсных точек игрока
	 * @type {number}
	 */
	supply;

	/**
	 * Кол-во юнитов игрока
	 * @type {number}
	 */
	units;

	/**
	 * Парсит данные юзера. Возвращает объект с данными
	 * @param {string} userHTML HTML код блока игрока
	 * @return {Object}
	 * @constructor
	 */
	constructor(userHTML){

		const data = userHTML.match(regexps.user);

		let status = data[1].match(/<img src=".+" alt="(.+)" title=".+" \/>/);
		status = status ? status[1]: 'Skip';

		this.primaryPing = status === 'Not received';
		this.secondPing = status === 'Completed';
		this.id = players[data[3]] ?? data[3];

		this.status = reaction.emoji[statuses[status]];
		this.flag = flags[data[2]];
		this.tag = data[2].slice(0,2).toUpperCase();
		this.supply = Number(data[7]);
		this.units = Number(data[8]);

	}

	/**
	 * Возвращает конструкцию упоминания пользователя
	 * @return {string}
	 */
	toString(){
		return '<@' + this.id + '>';
	}

}