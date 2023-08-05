const CanvasElement = require('./CanvasElement');
const { ALIGNMENT, COLOURS } = require('../renderingConstants');

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

module.exports = Rect;