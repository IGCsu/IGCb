const Canvas = require('canvas');
const { MessageAttachment } = require('discord.js');
const { request } = require('undici');

const WIDTH = 432

const RESOLUTION = {
	CARD_WIDTH: WIDTH,
	CARD_HEIGHT: Math.round(WIDTH / 2.6389)
}

const STYLE = {
	AVATAR_SHIFT: RESOLUTION.CARD_WIDTH / 23.75,
	AVATAR_SIZE: RESOLUTION.CARD_WIDTH / 4.75,
	ROUNDING: RESOLUTION.CARD_WIDTH / 38,
	BORDER_SIZE: RESOLUTION.CARD_WIDTH / 23.75,
	PROGRESSBAR_HEIGHT: RESOLUTION.CARD_WIDTH / 31.67,
	PROGRESSBAR_SHIFT: RESOLUTION.CARD_WIDTH / 31.67
}

const COLOURS = {
	BLACK: '#18191c',
	DARK_GRAY: '#2b2d31',
	RED: '#ff3737',
	WHITE: '#ffffff'

}

const x0 = STYLE.BORDER_SIZE + STYLE.AVATAR_SHIFT * 2 + STYLE.AVATAR_SIZE ;
const y0 =
	STYLE.AVATAR_SHIFT
	+ STYLE.BORDER_SIZE
	+ STYLE.AVATAR_SIZE
	- STYLE.PROGRESSBAR_HEIGHT
	- STYLE.PROGRESSBAR_SHIFT;

const x1 = RESOLUTION.CARD_WIDTH - STYLE.AVATAR_SHIFT + STYLE.BORDER_SIZE;
const y1 = y0;

Canvas.registerFont('./commands/levels/fonts/Inter/static/Inter-Bold.ttf', {family: 'Inter', weight: 'Bold'});

const applyText = (canvas, text, targetFontSize = 70 * (RESOLUTION.CARD_HEIGHT / 360), yOffset) => {
	const context = canvas.getContext('2d');
	let fontSize = targetFontSize * (RESOLUTION.CARD_HEIGHT / 360);
	do {
		context.font = `Bold ${fontSize -= 10}px Inter`;
	} while (context.measureText(text).width > RESOLUTION.CARD_WIDTH - (STYLE.BORDER_SIZE * 2));

	return {font: context.font, fontSize: fontSize};
};

class UserLevelCard {

	/**
	 *
	 * @param {UserLevels} userLevel класс представляющий информацию об уровне пользоватля
	 */
	constructor(userLevel) {
		this.userLevel = userLevel;
	}

	generateBackground(canvas, context) {
		// Bordered background
		context.fillStyle = COLOURS.DARK_GRAY;
		context.beginPath();
		context.roundRect(0, 0, RESOLUTION.CARD_WIDTH, RESOLUTION.CARD_HEIGHT, STYLE.ROUNDING);
		context.fill()

		// Main background
		context.fillStyle = COLOURS.BLACK;
		context.beginPath();
		context.roundRect(
			STYLE.BORDER_SIZE,
			STYLE.BORDER_SIZE,
			RESOLUTION.CARD_WIDTH - STYLE.BORDER_SIZE * 2,
			RESOLUTION.CARD_HEIGHT - STYLE.BORDER_SIZE * 2,
			STYLE.ROUNDING
		);
		context.fill()
	}

	generateProgressbar(canvas, context) {
		// Progress bar background
		context.fillStyle = COLOURS.DARK_GRAY;
		context.beginPath();
		context.roundRect(
			x0,
			y0,
			RESOLUTION.CARD_WIDTH - STYLE.AVATAR_SHIFT * 2 - STYLE.BORDER_SIZE * 3 - STYLE.AVATAR_SIZE,
			STYLE.PROGRESSBAR_HEIGHT,
			STYLE.ROUNDING
		);
		context.fill()

		// Fine progress bar
		if(this.userLevel.getExpFine()) {
			context.fillStyle = COLOURS.RED;
			const nextAmount = (
				this.userLevel.getNextRole() === true
					? this.userLevel.getRole()?.value
					: this.userLevel.getNextRole()?.value
			)
			context.beginPath();
			context.roundRect(
				x0,
				y0,
				(RESOLUTION.CARD_WIDTH - STYLE.AVATAR_SHIFT * 2 - STYLE.BORDER_SIZE * 3 - STYLE.AVATAR_SIZE) * (
					nextAmount < this.userLevel.getExpFull()
						? 1
						: this.userLevel.getExpFull()/nextAmount
				),
				STYLE.PROGRESSBAR_HEIGHT,
				STYLE.ROUNDING
			);
			context.fill()
		}

		// Progress bar main
		const grad = context.createLinearGradient(x0, y0, x1, y1);
		const exp1 = this.userLevel.getRole().cache.color.toString(16).length === 5
		const exp2 = (this.userLevel.getNextRole()?.cache ?? this.userLevel.getRole()?.cache).color.toString(16).length === 5
		grad.addColorStop(0.5, '#' + (exp1 ? '0' : '') + this.userLevel.getRole().cache.color.toString(16));
		grad.addColorStop(
			0.9,
			'#' + (exp2 ? '0' : '')
			+ (this.userLevel.getNextRole() === true ? this.userLevel.getRole(): this.userLevel.getNextRole())
				.cache.color.toString(16));

		context.fillStyle = grad;
		context.beginPath();
		context.roundRect(
			x0,
			y0,
			(RESOLUTION.CARD_WIDTH - STYLE.AVATAR_SHIFT * 2 - STYLE.BORDER_SIZE * 3 - STYLE.AVATAR_SIZE)
			* (this.userLevel.getNextRole() === true ? 100 : this.userLevel.getNextRoleProgress()) / 100,
			STYLE.PROGRESSBAR_HEIGHT,
			STYLE.ROUNDING
		);
		context.fill()
	}

	generateUsername(canvas, context) {
		// Username
		let txt = applyText(canvas, `${this.userLevel.member.displayName}`);
		context.font = txt.font
		context.fillStyle = this.userLevel.member.displayHexColor;
		context.fillText(
			`${this.userLevel.member.displayName}`,
			STYLE.BORDER_SIZE + STYLE.AVATAR_SHIFT * 2 + STYLE.AVATAR_SIZE,
			STYLE.BORDER_SIZE + STYLE.AVATAR_SHIFT + txt.fontSize);
	}

	generateExpValues(canvas, context) {
		// Previous role value
		let txt = applyText(canvas, `${this.userLevel.getRole().value.toLocaleString()}`, 40);
		context.font = txt.font
		context.fillStyle = COLOURS.WHITE;
		context.fillText(
			`${this.userLevel.getRole().value.toLocaleString()}`,
			x0,
			y0 + STYLE.PROGRESSBAR_HEIGHT + txt.fontSize);

		// Current exp
		txt = applyText(canvas, `${this.userLevel.getExpFull().toLocaleString()}`, 50);
		context.font = txt.font
		context.fillStyle = COLOURS.WHITE;
		context.fillText(
			`${this.userLevel.getExpFull().toLocaleString()}`,
			x0 + (RESOLUTION.CARD_WIDTH - STYLE.AVATAR_SHIFT * 2 - STYLE.BORDER_SIZE * 3 - STYLE.AVATAR_SIZE - context.measureText(
				this.userLevel.getNextRole() === true
					? this.userLevel.getRole()?.value?.toLocaleString()
					: this.userLevel.getNextRole()?.value?.toLocaleString()).width * (this.userLevel.getExpFine() ? 2 : 1))/2,
			y0 - txt.fontSize/2);

		// Fine exp
		if (this.userLevel.getExpFine()) {
			txt = applyText(canvas, `${'-' + this.userLevel.getExpFine().toLocaleString()}`, 50);
			context.font = txt.font
			context.fillStyle = COLOURS.WHITE;
			context.fillText(
				`${'-' + this.userLevel.getExpFine().toLocaleString()}`,
				x0 + (RESOLUTION.CARD_WIDTH - STYLE.AVATAR_SHIFT * 2 - STYLE.BORDER_SIZE * 3 - STYLE.AVATAR_SIZE) / 2,
				y0 - txt.fontSize / 2);
		}

		// Next role value
		txt = applyText(canvas, `${
			this.userLevel.getNextRole() === true
				? '🎉'
				: this.userLevel.getNextRole()?.value?.toLocaleString()}`, 40);
		context.font = txt.font
		context.fillStyle = COLOURS.WHITE;
		context.fillText(
			`${this.userLevel.getNextRole() === true
				? '🎉'
				: this.userLevel.getNextRole()?.value?.toLocaleString()}`,
			x0 + RESOLUTION.CARD_WIDTH - STYLE.AVATAR_SHIFT * 2 - STYLE.BORDER_SIZE * 3 - STYLE.AVATAR_SIZE - context.measureText(
				this.userLevel.getNextRole() === true
					? '🎉'
					: this.userLevel.getNextRole()?.value?.toLocaleString()).width,
			y0 + STYLE.PROGRESSBAR_HEIGHT + txt.fontSize);
	}

	async generateAvatar(canvas, context) {
		// Avatar
		context.beginPath();
		context.arc(
			STYLE.AVATAR_SHIFT + STYLE.BORDER_SIZE + STYLE.AVATAR_SIZE / 2,
			STYLE.AVATAR_SHIFT + STYLE.BORDER_SIZE + STYLE.AVATAR_SIZE / 2,
			STYLE.AVATAR_SIZE / 2,
			0, Math.PI * 2, true
		);
		context.closePath();
		context.clip();

		const {body} = await request(this.userLevel.member.displayAvatarURL({format: 'png', size: 4096}));
		const avatar = new Canvas.Image();
		avatar.src = Buffer.from(await body.arrayBuffer());
		context.drawImage(
			avatar,
			STYLE.AVATAR_SHIFT + STYLE.BORDER_SIZE,
			STYLE.AVATAR_SHIFT + STYLE.BORDER_SIZE,
			STYLE.AVATAR_SIZE,
			STYLE.AVATAR_SIZE
		);
	}

	async generate() {
		const canvas = Canvas.createCanvas(RESOLUTION.CARD_WIDTH, RESOLUTION.CARD_HEIGHT);
		const context = canvas.getContext('2d');

		this.generateBackground(canvas, context);
		this.generateProgressbar(canvas, context)
		this.generateUsername(canvas, context)
		this.generateExpValues(canvas, context)
		await this.generateAvatar(canvas, context)

		canvas.toBuffer('image/png')

		return new MessageAttachment(canvas.toBuffer('image/png'), `${this.userLevel.getExp()}.png`);
	}

}

module.exports = UserLevelCard