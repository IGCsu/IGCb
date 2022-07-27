const EmbedBuilder = require("./EmbedBuilder");

class WarnPagination {

	/**
	 * Пользователь, цель поиска
	 * @type {User}
	 */
	target;

	/**
	 * Всего варнов
	 * @type {number}
	 */
	count;

	/**
	 * Максимальное кол-во страниц
	 * @type {number}
	 */
	pageLast;

	/**
	 * Текущая страница
	 * @type {number}
	 */
	pageNumber;

	/**
	 * Кол-во записей на одной странице
	 * @type {number}
	 */
	pageCount;

	/**
	 * Список варнов
	 * @type {Warn[]}
	 */
	list = [];

	/**
	 * Возвращает страницу варнов. Если указать ID пользователя - выборка будет только по указанному пользователю
	 * @param {function} Warn Класс варна
	 * @param {User} [target] Пользователь
	 * @param {number|string} [pageNumber=1] Текущая страница
	 * @param {number|string} [pageCount=10] Кол-во записей на одной странице
	 * @constructor
	 */
	constructor(Warn, target, pageNumber, pageCount){
		this.pageNumber = Number(pageNumber ?? 1);
		this.pageCount = Number(pageCount ?? 5);

		if(target) this.target = target;

		const skip = this.pageCount * (this.pageNumber - 1);

		// TODO: Не стал делать фильтр удалённых варнов по флагам
		const query = target
			? `FROM warns WHERE target = ${this.target.id}`
			: `FROM warns`;
		this.count = DB.query('SELECT COUNT(*) AS count ' + query)[0].count;
		const data = DB.query('SELECT * ' + query + ' ORDER BY id DESC LIMIT ?, ?', [skip, this.pageCount]);

		for(const row of data){
			this.list.push(new Warn(row));
		}

		this.pageLast = Math.ceil(this.count / this.pageCount);
	}

	/**
	 * Возвращает эмбед списка варнов варна
	 * @param {CommandInteraction|ButtonInteraction} int
	 * @return {Object<InteractionReplyOptions>}
	 */
	async getEmbed(int){
		return EmbedBuilder.paginationWarns(int, this);
	}

}

module.exports = WarnPagination;