const Canvas = require('canvas');

/**
 * Создаёт копию канваса
 * @param {Canvas} oldCanvas
 * @returns {Canvas}
 */

global.copyCanvas = function (oldCanvas) {

	let newCanvas = Canvas.createCanvas(oldCanvas.width, oldCanvas.height);
	let context = newCanvas.getContext('2d');

	context.drawImage(oldCanvas, 0, 0);

	return newCanvas;
}
