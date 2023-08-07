const UserLevelCards = require('../UserLevelCard');
const { ALIGNMENT } = require('../renderingConstants');
const CanvasElement = require('./CanvasElement');
const { request } = require('undici');
const Canvas = require('canvas');

/**
 * Класс репрезентации любого элемента который имеет отрисовку картинки
 */
class Icon extends CanvasElement {

	/**
	 * Возращает ассет загруженый из источника
	 *
	 * @param {String} path
	 * @returns {Image}
	 */
	static #loadAsset(path) {
		const img = new Canvas.Image();
		img.src = path;

		return img;
	}

	/**
	 * Возращает ассет загруженый из кеша
	 *
	 * @param assetName
	 * @returns {Image}
	 */
	static #loadAssetFromCache(assetName) {
		const img = UserLevelCards.assets[assetName];

		if (!img) log.error("Unknown asset: " + assetName)

		return img;
	}

	constructor(
	  canvas, assetName=undefined, x=0, y=0, w=1, h=1, alignment=ALIGNMENT.TOP_LEFT
	) {
		super(canvas, x, y, w, h, alignment);
		if (assetName) this.asset = Icon.#loadAssetFromCache(assetName);
	}

	/**
	 * Загрузка ассета по Url
	 *
	 * @param {String} url
	 * @returns {Promise<void>}
	 */
	async loadAssetFromUrl(url) {
		const {body} = await request(url);
		const img = new Canvas.Image();
		img.src = Buffer.from(await body.arrayBuffer());

		this.asset = img;
	}

	/**
	 * Устанавлает соотношение сторон элемента как у картинки
	 *
	 * @param {boolean} setHeightAsPrimary Если true то высота останется неизменной, инче ширина
	 * @returns {boolean}
	 */
	useOriginalAspect(setHeightAsPrimary=false) {
		if (!this.asset) return false;
		this.originalAspect = this.asset.naturalWidth / this.asset.naturalHeight;
		if (!setHeightAsPrimary) {
			this.h = this.w / this.originalAspect;
		} else {
			this.w = this.h * this.originalAspect;
		}
	};

	/**
	 * Скругляет края по заданным параметрам
	 *
	 * @param {number | Array} r Радиус дуги для скругления углов. Можно указать 1 число либо же массив из 4 чисел. Второе позволит указать радиус индивидально для каждого угла прямоугольника.
	 * @returns {Icon}
	 */
	makeRounded(r=undefined) {
		this.context.save();													// Сохраниние кофигурации без вырезания

		this.context.beginPath();												// Начало пути маски

		if (r === undefined) {													// Скругление квадрата до круга
			const pos = this.getAlignedPoint(ALIGNMENT.CENTER_CENTER);
			this.context.arc(
			  pos.x, pos.y, Math.max(this.w, this.h) * 0.5, 0, Math.PI * 2
			);

		} else if (typeof r === 'number') {										// Скругление прямоугольника по указанному радиусу для всех углов
			let pos = this.getInBoundAlignedPoint(ALIGNMENT.TOP_LEFT);
			this.context.arc(
			  pos.x + r, pos.y + r, r, 0, Math.PI, Math.PI * 1.5
			);
			pos = this.getInBoundAlignedPoint(ALIGNMENT.TOP_RIGHT);
			this.context.arc(
			  pos.x - r, pos.y + r, r, Math.PI * 1.5, Math.PI * 2
			);
			pos = this.getInBoundAlignedPoint(ALIGNMENT.BOTTOM_RIGHT);
			this.context.arc(
			  pos.x - r, pos.y - r, r, Math.PI * 2, Math.PI * 0.5
			);
			pos = this.getInBoundAlignedPoint(ALIGNMENT.BOTTOM_LEFT);
			this.context.arc(
			  pos.x + r, pos.y - r, r, Math.PI * 0.5, Math.PI
			);

		} else if (r instanceof Array) {										// Скругление прямоугольника по указанному радиусу для каждого угла по отдельности
			let pos = this.getInBoundAlignedPoint(ALIGNMENT.TOP_LEFT);
			this.context.arc(
			  pos.x + r[0], pos.y + r[0], r[0], Math.PI, Math.PI * 1.5
			);
			pos = this.getInBoundAlignedPoint(ALIGNMENT.TOP_RIGHT);
			this.context.arc(
			  pos.x - r[1], pos.y + r[1], r[1], Math.PI * 1.5, Math.PI * 2
			);
			pos = this.getInBoundAlignedPoint(ALIGNMENT.BOTTOM_RIGHT);
			this.context.arc(
			  pos.x - r[2], pos.y - r[2], r[2], Math.PI * 2, Math.PI * 0.5
			);
			pos = this.getInBoundAlignedPoint(ALIGNMENT.BOTTOM_LEFT);
			this.context.arc(
			  pos.x + r[3], pos.y - r[3], r[3], Math.PI * 0.5, Math.PI
			);
		}

		this.context.closePath();												// Замыкание пути
		this.context.clip();													// Вырезание по задданой путём маске

		return this;
	}

	draw(context=undefined) {
		const ctx = context ?? this.context;
		if (this.asset)
			ctx.drawImage(this.asset, this.x, this.y, this.w, this.h);
		this.context.restore();
	}
}

module.exports = Icon;
