const CanvasElement = require('./CanvasElement');
const { ALIGNMENT, COLOURS, SCALE } = require('../renderingConstants');

/**
 * Класс репрезентации любого элемента текста
 */
class TextBox extends CanvasElement {
	constructor(
	  canvas, x=0, y=0, w=1, h=1,
	  alignment=ALIGNMENT.TOP_LEFT, color=COLOURS.WHITE,
	  text='', fontSize=70, font='Montserrat Medium'
	) {
		super(canvas, x, y, w, h, alignment);
		this.color = color;
		this.text = text;
		this.fontSize = fontSize * SCALE;
		this.font = font;
		this.context.textBaseline = "top";
	}

	/**
	 * Изменяет текст на новый
	 *
	 * @param {String} newTxt
	 * @param {number} maxTxtWidth
	 * @param {number} maxFont
	 */
	changeText(newTxt, maxTxtWidth, maxFont) {
		this.text = newTxt;
		this.fontSize = maxFont ?? this.fontSize;
		this.applyText(maxTxtWidth, maxFont);
		this.reapplyAlignment();
	}

	/**
	 * Устанавливает шрифт и его размер
	 *
	 * @param {String} font
	 * @param {String} fontSize
	 */
	applyFont(font=undefined, fontSize=undefined) {
		font = font ?? this.font;
		fontSize = fontSize ?? this.fontSize;
		const fnt = font.split(' ');
		this.context.font = ` ${fnt[1] ?? ''} ${fontSize}px ${fnt[0]}`;
	}

	/**
	 * Прмеряет текст к месту его отрисовки
	 *
	 * @param {number} maxTxtWidth
	 * @param {number} maxFont
	 * @returns {string}
	 */
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

module.exports = TextBox;
