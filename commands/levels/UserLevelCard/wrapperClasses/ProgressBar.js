const Rect = require('./Rect');
const { ALIGNMENT, COLOURS, STYLE } = require('../renderingConstants');
const TextBox = require('./TextBox');
const Icon = require('./Icon');


/**
 * Класс репрезентации элемента индикатора прогресса. Состоит из нескольких скруглённых прямоугольников (Фон; Основная полоса оптыа; Полоса штрафа) и двух тектовых полей (Знеачение текущего уровня и значение слудующего уровня)
 */
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
	 * Перемещает элементы прогресс бара на свои позиции относительно фона прогресс бара
	 */
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

	/**
	 * Меняет данные под указанного пользователя
	 *
	 * @param userLevel
	 */
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
			.replaceAll(',', '.')
		);

		if (userLevel.getNextRole() !== true) {
			this.nxtLvlTxt.shown = true;
			this.maxLvl.shown = false;
			this.nxtLvlTxt.changeText(
			  userLevel.getNextRole().value.toLocaleString()
				.replaceAll(' ', '.')
				.replaceAll(',', '.'),
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

module.exports = ProgressBar;
