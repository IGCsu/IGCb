const UserLevelCards = require('../UserLevelCard');
const { ALIGNMENT, STYLE } = require('../renderingConstants');
const CanvasElement = require('./CanvasElement');
const Canvas = require('canvas');
const gifFrames = require('gif-frames');
const { streamToBuffer } = require('@jorgeferrero/stream-to-buffer');

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
		this.gif = undefined;
		this.buffer = undefined
	}

	/**
	 * Загрузка ассета по Url
	 *
	 * @param {String} url
	 * @returns {Promise<void>}
	 */
	async loadAssetFromUrl(url) {
		try {
			if (url.split('?')[0].endsWith('.gif')) {
				this.cachedGifFrames = [];
				this.gifbuffer = Buffer.from(await (await fetch(url)).arrayBuffer());
				this.gif = await gifFrames(
				  { url: this.gifbuffer, frames: 'all', outputType: 'png' });
				this.buffer = await streamToBuffer(this.gif[0].getImage());
				this.asset = await Canvas.loadImage(this.buffer);
			} else {
				this.gif = undefined;
				this.cachedGifFrames = [];
				this.buffer = Buffer.from(await (await fetch(url)).arrayBuffer());
				this.asset = await Canvas.loadImage(this.buffer);
			}
		} catch (e) {
			log.warn(e)
			log.warn('Не удалось загрузить асет')
		}


	}

	/**
	 * Устанавлает соотношение сторон элемента как у картинки
	 *
	 * @param {boolean} setHeightAsPrimary Если true то высота останется
	 *   неизменной, инче ширина
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
	 * @param {number | Array} r Радиус дуги для скругления углов. Можно
	 *   указать 1 число либо же массив из 4 чисел. Второе позволит указать
	 *   радиус индивидально для каждого угла прямоугольника.
	 * @param {[]} bounds
	 * @returns {Icon}
	 */
	makeRounded(r=undefined, bounds=undefined) {
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
			let pos = this.getInBoundAlignedPoint(ALIGNMENT.TOP_LEFT, bounds);
			this.context.arc(
			  pos.x + r[0], pos.y + r[0], r[0], Math.PI, Math.PI * 1.5
			);
			pos = this.getInBoundAlignedPoint(ALIGNMENT.TOP_RIGHT, bounds);
			this.context.arc(
			  pos.x - r[1], pos.y + r[1], r[1], Math.PI * 1.5, Math.PI * 2
			);
			pos = this.getInBoundAlignedPoint(ALIGNMENT.BOTTOM_RIGHT, bounds);
			this.context.arc(
			  pos.x - r[2], pos.y - r[2], r[2], Math.PI * 2, Math.PI * 0.5
			);
			if (bounds)
				this.context.arc(
				  STYLE.BORDER_SIZE + STYLE.AVATAR_SIZE / 2, STYLE.AVATAR_SHIFT + STYLE.AVATAR_SIZE / 2, STYLE.AVATAR_BG_BORDER + STYLE.AVATAR_SIZE / 2, Math.PI * 2, Math.PI, true
				);
			pos = this.getInBoundAlignedPoint(ALIGNMENT.BOTTOM_LEFT, bounds);
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
