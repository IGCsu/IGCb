const Canvas = require('canvas');
const fetch = require('node-fetch')
const {MessageAttachment} = require('discord.js');
const {request} = require('undici');

Canvas.registerFont('./commands/levels/fonts/Inter/static/Inter-Bold.ttf', {family: 'Inter', weight: 'Bold'})

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
	 * @type {{ avatarShift: number, rounding: number, avatarSize: number, borderSize: number,
	 * 		progressbarHeight: number, progressbarShift: number }}
	 */
	#style = {
		avatarShift: 40,
		avatarSize: 200,
		rounding: 25,
		borderSize: 40,
		progressbarHeight: 30,
		progressbarShift: 30
	}

	/**
	 *
	 * @param {UserLevels} userLevel класс представляющий информацию об уровне пользоватля
	 */
	constructor(userLevel) {
		this.userLevel = userLevel;
	}

	async generate() {
		const canvas = Canvas.createCanvas(950, 360);
		const context = canvas.getContext('2d');

		// Bordered background
		context.fillStyle = '#292b2f';
		context.roundRect(0, 0, canvas.width, canvas.height, this.#style.rounding).fill();

		// Main background
		context.fillStyle = '#18191c';
		context.roundRect(
			this.#style.borderSize,
			this.#style.borderSize,
			canvas.width - this.#style.borderSize * 2,
			canvas.height - this.#style.borderSize * 2,
			this.#style.rounding
		).fill();

		const x0 = this.#style.borderSize + this.#style.avatarShift * 2 + this.#style.avatarSize ;
		const y0 =
			this.#style.avatarShift
			+ this.#style.borderSize
			+ this.#style.avatarSize
			- this.#style.progressbarHeight
			- this.#style.progressbarShift;

		const x1 = canvas.width - this.#style.avatarShift + this.#style.borderSize;
		const y1 = y0;

		// Progress bar background
		context.fillStyle = '#292b2f';
		context.roundRect(
			x0,
			y0,
			canvas.width - this.#style.avatarShift * 2 - this.#style.borderSize * 3 - this.#style.avatarSize,
			this.#style.progressbarHeight,
			this.#style.rounding
		).fill();

		// Fine progress bar
		if(this.userLevel.getExpFine()) {

			context.fillStyle = '#ff3737';
			const nextAmount =
				(this.userLevel.getNextRole() === true
					? this.userLevel.getRole()?.value
					: this.userLevel.getNextRole()?.value)
			context.roundRect(
				x0,
				y0,
				(canvas.width - this.#style.avatarShift * 2 - this.#style.borderSize * 3 - this.#style.avatarSize) * (
					nextAmount < this.userLevel.getExpFull()
						? 1
						: this.userLevel.getExpFull()/nextAmount),
				this.#style.progressbarHeight,
				this.#style.rounding
			).fill();
		}

		// Progress bar main
		const grad = context.createLinearGradient(x0,y0,x1,y1);
		const exp1 = this.userLevel.getRole().cache.color.toString(16).length === 5
		const exp2 = (this.userLevel.getNextRole()?.cache ?? this.userLevel.getRole()?.cache).color.toString(16).length === 5
		grad.addColorStop(0.5, '#' + (exp1 ? '0' : '') + this.userLevel.getRole().cache.color.toString(16));
		grad.addColorStop(0.9, '#' + (exp2 ? '0' : '') + (
			this.userLevel.getNextRole() === true
				? this.userLevel.getRole()
				: this.userLevel.getNextRole()
			).cache.color.toString(16));

		context.fillStyle = grad;
		context.roundRect(
			x0,
			y0,
			(canvas.width - this.#style.avatarShift * 2 - this.#style.borderSize * 3 - this.#style.avatarSize)
				* (this.userLevel.getNextRole() === true
					? 100
					: this.userLevel.getNextRoleProgress()) / 100,
			this.#style.progressbarHeight,
			this.#style.rounding
		).fill();


		// Username
		let txt = applyText(canvas, `${this.userLevel.member.displayName}`);
		context.font = txt.font
		context.fillStyle = this.userLevel.member.displayHexColor;
		context.fillText(
			`${this.userLevel.member.displayName}`,
			this.#style.borderSize + this.#style.avatarShift * 2 + this.#style.avatarSize,
			this.#style.borderSize + this.#style.avatarShift + txt.fontSize);

		// Previous role value
		txt = applyText(canvas, `${this.userLevel.getRole().value.toLocaleString()}`, 40);
		context.font = txt.font
		context.fillStyle = '#ffffff';
		context.fillText(
			`${this.userLevel.getRole().value.toLocaleString()}`,
			x0,
			y0 + this.#style.progressbarHeight + txt.fontSize);

		// Current exp
		txt = applyText(canvas, `${this.userLevel.getExpFull().toLocaleString()}`, 50);
		context.font = txt.font
		context.fillStyle = '#ffffff';
		context.fillText(
			`${this.userLevel.getExpFull().toLocaleString()}`,
			x0 + (canvas.width - this.#style.avatarShift * 2 - this.#style.borderSize * 3 - this.#style.avatarSize - context.measureText(
				this.userLevel.getNextRole() === true
					? this.userLevel.getRole()?.value?.toLocaleString()
					: this.userLevel.getNextRole()?.value?.toLocaleString()).width * (this.userLevel.getExpFine() ? 2 : 1))/2,
			y0 - txt.fontSize/2);

		// Fine exp
		if (this.userLevel.getExpFine()) {
			txt = applyText(canvas, `${'-' + this.userLevel.getExpFine().toLocaleString()}`, 50);
			context.font = txt.font
			context.fillStyle = '#ff3737';
			context.fillText(
				`${'-' + this.userLevel.getExpFine().toLocaleString()}`,
				x0 + (canvas.width - this.#style.avatarShift * 2 - this.#style.borderSize * 3 - this.#style.avatarSize) / 2,
				y0 - txt.fontSize / 2);
		}

		// Next role value
		txt = applyText(canvas, `${
			this.userLevel.getNextRole() === true 
			? '🎉'
			: this.userLevel.getNextRole()?.value?.toLocaleString()}`, 40);
		context.font = txt.font
		context.fillStyle = '#ffffff';
		context.fillText(
			`${this.userLevel.getNextRole() === true
				? '🎉'
				: this.userLevel.getNextRole()?.value?.toLocaleString()}`,
			x0 + canvas.width - this.#style.avatarShift * 2 - this.#style.borderSize * 3 - this.#style.avatarSize - context.measureText(
				this.userLevel.getNextRole() === true
				? '🎉'
				: this.userLevel.getNextRole()?.value?.toLocaleString()).width,
			y0 + this.#style.progressbarHeight + txt.fontSize);

		// Avatar
		context.beginPath();
		context.arc(
			this.#style.avatarShift + this.#style.borderSize + this.#style.avatarSize / 2,
			this.#style.avatarShift + this.#style.borderSize + this.#style.avatarSize / 2,
			this.#style.avatarSize / 2,
			0, Math.PI * 2, true
		);
		context.closePath();
		context.clip();

		const {body} = await request(this.userLevel.member.displayAvatarURL({format: 'png'}));
		const avatar = new Canvas.Image();
		avatar.src = Buffer.from(await body.arrayBuffer());
		context.drawImage(
			avatar,
			this.#style.avatarShift + this.#style.borderSize,
			this.#style.avatarShift + this.#style.borderSize,
			this.#style.avatarSize,
			this.#style.avatarSize
		);

		return new MessageAttachment(canvas.toBuffer('image/png'), 'user_card.png');
	}

}

module.exports = UserLevelCard