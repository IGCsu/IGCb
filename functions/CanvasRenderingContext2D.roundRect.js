const { CanvasRenderingContext2D } = require('canvas');


/**
 *
 * @param x { number } x point of the rect
 * @param y { number } y point of the rect
 * @param w { number } Width of the rect
 * @param h { number } Height of the rect
 * @param r { number } Rounding the radius
 * @return { CanvasRenderingContext2D }
 */
CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
	if (w < 2 * r) r = w / 2;
	if (h < 2 * r) r = h / 2;

	this.beginPath();
	this.moveTo(x+r, y);

	this.arcTo(x+w, y, x+w, y+h, r);
	this.arcTo(x+w, y+h, x, y+h, r);

	this.arcTo(x, y+h, x, y, r);
	this.arcTo(x, y, x+w, y, r);

	this.closePath();

	return this;
}