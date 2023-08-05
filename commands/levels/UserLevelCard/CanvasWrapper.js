const Canvas = require('canvas');
const { request } = require('undici');
const { ALIGNMENT, COLOURS, STYLE, SCALE, RESOLUTION } = require('./renderingConstants');
const UserLevelCards = require('./UserLevelCard');

class CanvasElement {
	constructor(canvas, x=0, y=0, w=1, h=1, alignment=ALIGNMENT.TOP_LEFT) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.alignment = alignment;
		this.context = canvas.getContext('2d');
	}

	move(x=0, y=0) {
		this.x += x;
		this.y += y;
		return this;
	}

	moveToPoint(x, y) {
		this.x = x;
		this.y = y;
		this.reapplyAlignment();
		return this;
	}

	/**
	 *
	 * @param obj {CanvasElement}
	 */
	moveToObject(obj) {
		this.moveToPoint(obj.x + obj.w * this.alignment[1], obj.y + obj.h * this.alignment[0]);
		return this;
	}

	/**
	 * Смещает начальную точку объекта из левого верхнего в указаный
	 */
	reapplyAlignment(alignment=undefined) {
		alignment = alignment ?? this.alignment;
		this.x -= this.w * alignment[1];
		this.y -= this.h * alignment[0];
	}

	getAlignedPoint(alignment=ALIGNMENT.TOP_LEFT) {
		return {
			x: this.x + (this.w * alignment[1]), y: this.y + (this.h * alignment[0])
		};
	}

	getInBoundAlignedPoint(alignment=ALIGNMENT.TOP_LEFT) {
		return {
			x: Math.min(Math.max(this.x + (this.w * alignment[1]), 0), RESOLUTION.CARD_WIDTH),
			y: Math.min(Math.max(this.y + (this.h * alignment[0]), 0), RESOLUTION.CARD_HEIGHT)
		};
	}
}

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

class Rect extends CanvasElement {
	constructor(
	  canvas, x=0, y=0, w=1, h=1,
	  alignment=ALIGNMENT.TOP_LEFT, color=COLOURS.BLACK, rounding=0
	) {
		super(canvas, x, y, w, h, alignment);
		this.color = color;
		this.rounding = rounding;
	}

	draw(context=undefined) {
		const ctx = context ?? this.context;
		ctx.fillStyle = this.color;
		ctx.beginPath();
		ctx.roundRect(this.x, this.y, this.w, this.h, this.rounding);
		ctx.fill();
	}
}

class TextBox extends CanvasElement {
	constructor(
	  canvas, x=0, y=0, w=1, h=1,
	  alignment=ALIGNMENT.TOP_LEFT, color=COLOURS.WHITE,
	  text='', fontSize=70, font='Inter Regular'
	) {
		super(canvas, x, y, w, h, alignment);
		this.color = color;
		this.text = text;
		this.fontSize = fontSize * SCALE;
		this.font = font;
		this.context.textBaseline = "top";
	}

	changeText(newTxt, maxTxtWidth, maxFont) {
		this.text = newTxt;
		this.fontSize = maxFont ?? this.fontSize;
		this.applyText(maxTxtWidth, maxFont);
		this.reapplyAlignment();
	}

	applyFont(font=undefined, fontSize=undefined) {
		font = font ?? this.font;
		fontSize = fontSize ?? this.fontSize;
		const fnt = font.split(' ');
		this.context.font = ` ${fnt[1] ?? ''} ${fontSize}px ${fnt[0]}`;
	}

	applyText(maxTxtWidth, maxFont) {
		this.applyFont();
		let outputWidth = this.context.measureText(this.text).width;
		if (outputWidth > maxTxtWidth) {
			let stepSize = Math.max(Math.ceil((outputWidth - maxTxtWidth) / 10), 1);
			do {
				this.fontSize -= stepSize;
				this.applyFont();
				outputWidth = this.context.measureText(this.text).width;
				stepSize = Math.max(Math.ceil((outputWidth - maxTxtWidth) / 10), 1);
			} while ((outputWidth > maxTxtWidth) && (this.fontSize > 1));
		}

		if(this.fontSize > maxFont) {
			this.fontSize = maxFont;
			this.applyFont();
		}

		const txtMetrics = this.context.measureText(this.text);

		this.w = txtMetrics.width;
		this.h = txtMetrics.actualBoundingBoxDescent;

		return this.context.font;
	};

	draw(maxTxtWidth, context=undefined) {
		const ctx = context ?? this.context;
		ctx.font = this.applyText(maxTxtWidth);
		ctx.fillStyle = this.color;
		this.applyFont(this.font, this.fontSize);
		ctx.fillText(this.text, this.x, this.y);
	}
}


class Label extends Rect {

	constructor (
	  canvas, x=0, y=0, w=1, h=1,
	  alignment=ALIGNMENT.TOP_LEFT, color=COLOURS.DARK_GRAY, rounding=0,
	  text='', fontSize=70
	) {
		super(canvas, x, y, w, h, alignment, color, rounding);
		this.primaryText = new TextBox(canvas, x, y, w, h,  ALIGNMENT.CENTER_CENTER, COLOURS.WHITE, text, fontSize, 'Sans Regular');
		this.secondaryText = null;
		this.icon = null;
		this.elShift = 10;
		this.faceShift = this.elShift * 2;
	}

	setPrimaryText(primaryText) {
		this.primaryText = primaryText;
		return this;
	}

	setSecondaryText(secondaryText) {
		this.secondaryText = secondaryText;
		return this;
	}

	setIcon(icon) {
		this.icon = icon;
		return this;
	}

	reposElements() {
		this.w = this.primaryText.w + (this.faceShift * 3)
		  + (this.icon ? this.icon.w + this.elShift : 0)
		  + (this.secondaryText ? this.secondaryText.w + this.elShift : 0);
		this.h = this.primaryText.h + (this.faceShift * 1.5);

		this.primaryText.alignment = ALIGNMENT.CENTER_CENTER;
		this.primaryText.moveToObject(this);
		if (this.secondaryText) {
			this.primaryText.move(-this.faceShift*2, 0)
			this.secondaryText.alignment = ALIGNMENT.CENTER_RIGHT;
			this.secondaryText.moveToObject(this);
			this.secondaryText.move(-this.faceShift*2, 0);
			this.w -= this.faceShift;
			this.secondaryText.move(0, -5);
			this.secondaryText.context.textBaseline = 'middle';
			this.secondaryText.move(0, this.secondaryText.h / 1.7);
			this.icon.move(this.elShift + this.secondaryText.w, 0);
		}
		if (this.icon) {
			this.primaryText.move(this.faceShift, 0)
			this.icon.alignment = ALIGNMENT.CENTER_LEFT;
			this.icon.moveToObject(this.primaryText);
			this.icon.move(-this.elShift - this.icon.w, 0);
		}

		this.primaryText.move(0, -5)

	}

	draw(context=undefined) {
		const ctx = context ?? this.context;

		this.reposElements();

		super.draw(ctx);
		this.primaryText.context.textBaseline = 'middle';
		this.primaryText.move(0, this.primaryText.h / 1.7);

		this.primaryText.draw(ctx);
		if (this.secondaryText) this.secondaryText.draw(ctx);
		if (this.icon) this.icon.draw(ctx);
	}
}


class ProgressBar extends Rect {

	constructor (
	  canvas, x=0, y=0, w=1, h=1,
	  alignment=ALIGNMENT.TOP_LEFT, color=COLOURS.DARK_GRAY, rounding=0,
	) {
		super(canvas, x, y, w, h, alignment, color, rounding);
		this.expBar = new Rect(canvas, x, y, w, h, alignment, COLOURS.WHITE, rounding);
		this.fineBar = new Rect(canvas, x, y, w, h, alignment, COLOURS.RED, rounding);
		this.currLvlTxt = new TextBox(canvas, x, y, w, 100, ALIGNMENT.TOP_LEFT, COLOURS.WHITE, '...', 40);
		this.nxtLvlTxt = new TextBox(canvas, x, y, 100, h, ALIGNMENT.TOP_RIGHT, COLOURS.WHITE, '...', 40);
		this.maxLvl = new Icon(canvas, undefined, x, y,
		  STYLE.MAX_LEVEL_ICON_SIDE_LENGTH, STYLE.MAX_LEVEL_ICON_SIDE_LENGTH,
		  ALIGNMENT.TOP_RIGHT
		);
	}

	move(x=0, y=0) {
		super.move(x, y);
		this.reposElements();

		return this;
	}

	moveToPoint (x, y) {
		super.moveToPoint(x, y);
		this.reposElements();
		return this
	}

	/**
	 *
	 * @param obj {CanvasElement}
	 */
	moveToObject(obj) {
		super.moveToObject(obj);
		return this;
	}

	reposElements() {
		this.expBar.moveToObject(this);
		this.fineBar.moveToObject(this);
		this.currLvlTxt
		  .moveToObject(this)
		  .move(0, STYLE.PROGRESSBAR_SHIFT_DOWN + this.h);
		this.nxtLvlTxt
		  .moveToObject(this)
		  .move(0, STYLE.PROGRESSBAR_SHIFT_DOWN + this.h);
		this.maxLvl
		  .moveToObject(this)
		  .move(0, STYLE.PROGRESSBAR_SHIFT_DOWN + this.h);
	}

	applyToUser(userLevel) {
		if (userLevel.getExpFine()) {
			this.fineBar.shown = true;
			const nextAmount = (
			  userLevel.getNextRole() === true
				? userLevel.getRole()?.value
				: userLevel.getNextRole()?.value
			);

			this.fineBar.w = STYLE.PROGRESSBAR_WIDTH *  (
			  nextAmount < userLevel.getExpFull()
				? 1
				: userLevel.getExpFull()/nextAmount
			);
		}

		this.expBar.color = userLevel.getNextRoleColor();

		const expProgress = (userLevel.getNextRoleProgress() !== true
		  ? userLevel.getNextRoleProgress() : 100)


		this.expBar.w = STYLE.PROGRESSBAR_WIDTH * expProgress / 100;

		this.currLvlTxt.changeText(
		  userLevel.getRole().value.toLocaleString()
			.replaceAll(' ', '.')
		);

		if (userLevel.getNextRole() !== true) {
			this.nxtLvlTxt.shown = true;
			this.maxLvl.shown = false;
			this.nxtLvlTxt.changeText(
			  userLevel.getNextRole().value.toLocaleString()
				.replaceAll(' ', '.'),
			);
		} else {
			this.maxLvl.shown = true;
			this.nxtLvlTxt.shown = false;
		}
		this.reposElements();
	}

	draw(context=undefined) {
		const ctx = context ?? this.context;

		super.draw(ctx);
		if (this.fineBar.shown) this.fineBar.draw(ctx);
		this.expBar.draw(ctx);
		this.currLvlTxt.draw(ctx);
		if (this.nxtLvlTxt.shown) this.nxtLvlTxt.draw(ctx);
		if (this.maxLvl.shown) this.maxLvl.draw(ctx);
	}
}


module.exports = {
	CanvasElement,
	Rect,
	TextBox,
	Icon,
	Label,
	ProgressBar
}