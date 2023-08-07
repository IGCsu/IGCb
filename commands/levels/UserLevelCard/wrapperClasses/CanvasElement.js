const { ALIGNMENT, RESOLUTION } = require('../renderingConstants');

/**
 * Класс представляющий основные характеристики любого отображаемого элемента
 * Такие как координаты, габариты, выравнивание и контекст
 */
class CanvasElement {
	constructor(canvas, x=0, y=0, w=1, h=1, alignment=ALIGNMENT.TOP_LEFT) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.alignment = alignment;
		this.context = canvas.getContext('2d');
	}

	/**
	 * Относительно от своей текущей позиции смещает элемент по холсту
	 *
	 * @param {number} x
	 * @param {number} y
	 * @returns {CanvasElement}
	 */
	move(x=0, y=0) {
		this.x += x;
		this.y += y;
		return this;
	}

	/**
	 * Явное указание координат элемента
	 * @param {number} x
	 * @param {number} y
	 * @returns {CanvasElement}
	 */
	moveToPoint(x, y) {
		this.x = x;
		this.y = y;
		this.reapplyAlignment();
		return this;
	}

	/**
	 * Перемещение элемента на место другого элемента с учётом выравнивания перемещаемого элемента
	 *
	 * @param obj {CanvasElement}
	 * @returns {CanvasElement}
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

	/**
	 * Возварщает координаты точки на элементе выровненой по указанному выравниванию
	 *
	 * @param alignment
	 * @returns {{x: number, y: number}}
	 */
	getAlignedPoint(alignment=ALIGNMENT.TOP_LEFT) {
		return {
			x: this.x + (this.w * alignment[1]), y: this.y + (this.h * alignment[0])
		};
	}

	/**
	 * Делает то же что и getInBoundAlignedPoint но ограничивает координаты габаритами холста
	 *
	 * @param alignment
	 * @returns {{x: number, y: number}}
	 */
	getInBoundAlignedPoint(alignment=ALIGNMENT.TOP_LEFT) {
		return {
			x: Math.min(Math.max(this.x + (this.w * alignment[1]), 0), RESOLUTION.CARD_WIDTH),
			y: Math.min(Math.max(this.y + (this.h * alignment[0]), 0), RESOLUTION.CARD_HEIGHT)
		};
	}
}

module.exports = CanvasElement;
