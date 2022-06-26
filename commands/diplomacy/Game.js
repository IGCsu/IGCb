const seasons = require('./gameData/seasons.json');
const phases = require('./gameData/phases.json');
const fetch = require("node-fetch");
const timeVariants = require("./gameData/timeVariants.json");

const regexps = require("./gameData/regexps");

module.exports = class Game {

	/**
	 * Кэш данных парсинга
	 * @type {Object}
	 */
	#cache = {};

	/**
	 * ID игры на сайте
	 * @type {number}
	 */
	id;

	/**
	 * Интервал в секундах между запросами
	 * @type {number}
	 */
	interval;

	/**
	 * HTML код страницы
	 * @type {string}
	 */
	body;

	/**
	 * Временная метка обновления
	 * @type {number}
	 */
	updateTime;

	/**
	 * Парсит данные юзера. Возвращает объект с данными
	 * @param {number} gameID ID игры на сайте
	 * @param {number} interval Интервал в секундах между запросами
	 * @return {Object}
	 * @constructor
	 */
	constructor(gameID, interval){

		this.id = gameID;
		this.interval = interval;

	}

	/**
	 * Инициализирует соединение с сайтом
	 */
	async fetch(){
		const response = await fetch('https://www.vdiplomacy.com/board.php?gameID=' + this.id);

		this.updateTime = Math.floor(Date.now() / 1000);
		this.body = await response.text();
	}

	/**
	 * Проверяет, случился ли ход с последнего обновления
	 * @return {boolean} true - ход случился, false - новый ход не случился
	 */
	newTurnCheck(){
		const phaseLength = this.getPhaseLength();
		const turnDeadline = this.getDeadline();

		return this.updateTime + phaseLength - this.interval < turnDeadline && this.interval < phaseLength;
	}

	/**
	 * Возвращает timestamp дедлайна
	 * @return {number|undefined}
	 */
	getDeadline(){
		if(this.#cache.deadline) return this.#cache.deadline;
		const deadline = this.body.match(regexps.deadline);
		return this.#cache.deadline = deadline ? Number(deadline[1]) : undefined;
	}

	/**
	 * Возвращает время хода
	 * @return {number}
	 */
	getPhaseLength(){
		if(this.#cache.phaseLength) return this.#cache.phaseLength;
		const phaseLengthName = this.body.match(regexps.phaseLength);
		return this.#cache.phaseLength = timeVariants[phaseLengthName];
	}

	/**
	 * Возвращает номер хода
	 * @return {number}
	 */
	getTurn(){
		if(this.#cache.turn) return this.#cache.turn;
		const turn = this.body.match(regexps.turn);
		return this.#cache.turn = turn ? Number(turn[1]) : undefined;
	}

	/**
	 * Возвращает информацию об игре
	 * @return {string[]}
	 */
	getInfo(){
		if(this.#cache.info) return this.#cache.info;
		return this.#cache.info = this.body.match(regexps.info);
	}

	/**
	 * Возвращает сезон
	 * @return {string}
	 */
	getSeason(){
		if(this.#cache.season) return this.#cache.season;
		const info = this.getInfo();
		const seasonCode = info ? info[1] : undefined;
		return this.#cache.season = seasons[seasonCode] ?? seasonCode;
	}

	/**
	 * Возвращает фазу
	 * @return {string}
	 */
	getPhase(){
		if(this.#cache.phase) return this.#cache.phase;
		const info = this.getInfo();
		const phaseCode = info ? info[3] : undefined;
		return this.#cache.phase = phases[phaseCode] ?? phaseCode;
	}

	/**
	 * Возвращает год
	 * @return {number}
	 */
	getYear(){
		if(this.#cache.year) return this.#cache.year;
		const info = this.getInfo();
		return this.#cache.year = info ? Number(info[2]) : undefined;
	}

	/**
	 * Возвращает массив HTML блоков игроков
	 * @return {string[]}
	 */
	getUsers(){
		if(this.#cache.users) return this.#cache.users;
		return this.#cache.users = this.body.match(regexps.users);
	}

	/**
	 * Возвращает ссылку на карту игры
	 * @return {string}
	 */
	getImage(){
		return 'https://www.vdiplomacy.com/map.php?gameID=' + this.id + '&turn=' + this.getTurn() + '&mapType=large';
	}

	/**
	 * Проверяет доступность сайта и игры
	 * @param {number} gameID ID игры на сайте
	 * @return {Promise<string>}
	 */
	static getStatusGame(gameID){
		return new Promise(async (resolve, reject) => {
			const response = await fetch('https://www.vdiplomacy.com/board.php?gameID=' + gameID);

			if(!response) reject('Сайт недоступен');

			const body = await response.text();

			if(body.includes('Game not found')) reject('Игра ID:' + gameID + ' не найдена');

			return resolve('success');
		});
	}

	}
