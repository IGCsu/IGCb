const UserLevelCards = require('../UserLevelCard');
const { ALIGNMENT } = require('../renderingConstants');
const CanvasElement = require('./CanvasElement');
const { request } = require('undici');
const Canvas = require('canvas');

class Icon extends CanvasElement {

	static #loadAsset(path) {
		const img = new Canvas.Image();
		img.src = path;

		return img;
	}

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

	async loadAssetFromUrl(url) {
		const {body} = await request(url);
		const img = new Canvas.Image();
		img.src = Buffer.from(await body.arrayBuffer());

		this.asset = img;
	}

	useOriginalAspect(setHeightAsPrimary=false) {
		if (!this.asset) return false;
		this.originalAspect = this.asset.naturalWidth / this.asset.naturalHeight;
		if (!setHeightAsPrimary) {
			this.h = this.w / this.originalAspect;
		} else {
			this.w = this.h * this.originalAspect;
		}
	};

	makeRounded(r=undefined) {


		this.context.save();

		this.context.beginPath();
		if (r === undefined) {
			const pos = this.getAlignedPoint(ALIGNMENT.CENTER_CENTER);
			this.context.arc(
			  pos.x, pos.y, Math.max(this.w, this.h) * 0.5, 0, Math.PI * 2
			);
		} else if (typeof r === 'number') {
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
		} else if (r instanceof Array) {
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
		this.context.closePath();
		this.context.clip();

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