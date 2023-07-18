const Canvas = require('canvas');
const { MessageAttachment } = require('discord.js');
const { request } = require('undici');

const STYLE = {
	CARD_WIDTH: 950,
	CARD_HEIGHT: 360,
	AVATAR_SHIFT: 40,
	AVATAR_SIZE: 200,
	ROUNDING: 25,
	BORDER_SIZE: 40,
	PROGRESSBAR_HEIGHT: 30,
	PROGRESSBAR_SHIFT: 30
}

const COLOURS = {
	BLACK: '#18191c',
	DARK_GRAY: '#292b2f',
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

const x1 = STYLE.CARD_WIDTH - STYLE.AVATAR_SHIFT + STYLE.BORDER_SIZE;
const y1 = y0;

Canvas.registerFont('./commands/levels/fonts/Inter/static/Inter-Bold.ttf', {family: 'Inter', weight: 'Bold'});

const applyText = (canvas, text, targetFontSize = 70, yOffset) => {
	const context = canvas.getContext('2d');
	let fontSize = targetFontSize;
	do {
		context.font = `Bold ${fontSize -= 10}px Inter`;
	} while (context.measureText(text).width > canvas.width - 80);

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
		context.roundRect(0, 0, canvas.width, canvas.height, STYLE.ROUNDING);

		// Main background
		context.fillStyle = COLOURS.BLACK;
		context.roundRect(
			STYLE.BORDER_SIZE,
			STYLE.BORDER_SIZE,
			canvas.width - STYLE.BORDER_SIZE * 2,
			canvas.height - STYLE.BORDER_SIZE * 2,
			STYLE.ROUNDING
		);
	}

	generateProgressbar(canvas, context) {
		// Progress bar background
		context.fillStyle = COLOURS.DARK_GRAY;
		context.roundRect(
			x0,
			y0,
			canvas.width - STYLE.AVATAR_SHIFT * 2 - STYLE.BORDER_SIZE * 3 - STYLE.AVATAR_SIZE,
			STYLE.PROGRESSBAR_HEIGHT,
			STYLE.ROUNDING
		);

		// Fine progress bar
		if(this.userLevel.getExpFine()) {
			context.fillStyle = COLOURS.RED;
			const nextAmount = (
				this.userLevel.getNextRole() === true
					? this.userLevel.getRole()?.value
					: this.userLevel.getNextRole()?.value
			)
			context.roundRect(
				x0,
				y0,
				(canvas.width - STYLE.AVATAR_SHIFT * 2 - STYLE.BORDER_SIZE * 3 - STYLE.AVATAR_SIZE) * (
					nextAmount < this.userLevel.getExpFull()
						? 1
						: this.userLevel.getExpFull()/nextAmount
				),
				STYLE.PROGRESSBAR_HEIGHT,
				STYLE.ROUNDING
			);
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
		context.roundRect(
			x0,
			y0,
			(canvas.width - STYLE.AVATAR_SHIFT * 2 - STYLE.BORDER_SIZE * 3 - STYLE.AVATAR_SIZE)
			* (this.userLevel.getNextRole() === true ? 100 : this.userLevel.getNextRoleProgress()) / 100,
			STYLE.PROGRESSBAR_HEIGHT,
			STYLE.ROUNDING
		);
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
			x0 + (canvas.width - STYLE.AVATAR_SHIFT * 2 - STYLE.BORDER_SIZE * 3 - STYLE.AVATAR_SIZE - context.measureText(
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
				x0 + (canvas.width - STYLE.AVATAR_SHIFT * 2 - STYLE.BORDER_SIZE * 3 - STYLE.AVATAR_SIZE) / 2,
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
			x0 + canvas.width - STYLE.AVATAR_SHIFT * 2 - STYLE.BORDER_SIZE * 3 - STYLE.AVATAR_SIZE - context.measureText(
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

		const {body} = await request(this.userLevel.member.displayAvatarURL({format: 'png'}));
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
		const canvas = Canvas.createCanvas(STYLE.CARD_WIDTH, STYLE.CARD_HEIGHT);
		const context = canvas.getContext('2d');

		this.generateBackground(canvas, context);
		this.generateProgressbar(canvas, context)
		this.generateUsername(canvas, context)
		this.generateExpValues(canvas, context)
		await this.generateAvatar(canvas, context)

		return new MessageAttachment(canvas.toBuffer('image/png'), `${this.userLevel.getExp()}.png`);
	}

}

module.exports = UserLevelCard