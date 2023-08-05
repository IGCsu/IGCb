const Canvas = require('canvas');
const { request } = require('undici');
const { ALIGNMENT, COLOURS, STYLE, SCALE, RESOLUTION } = require('./renderingConstants');
const UserLevelCards = require('./UserLevelCard');
const CanvasElement = require('./wrapperClasses/CanvasElement');
const Icon = require('./wrapperClasses/Icon');
const Rect = require('./wrapperClasses/Rect');
const TextBox = require('./wrapperClasses/TextBox');
const Label = require('./wrapperClasses/Label');
const ProgressBar = require('./wrapperClasses/ProgressBar');


module.exports = {
	CanvasElement,
	Rect,
	TextBox,
	Icon,
	Label,
	ProgressBar
}
