const Rect = require('./Rect');
const { ALIGNMENT, COLOURS } = require('../renderingConstants');
const TextBox = require('./TextBox');

/**
 * Класс репрезентации элемента Label. По сути являтеся цветной пилюлель с обязательным основным текстом, необязательным вторичным текстом и необязательной иконкой.
 */
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

module.exports = Label;