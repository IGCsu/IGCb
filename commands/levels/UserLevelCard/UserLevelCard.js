const Canvas = require('canvas');
const fs = require('fs');
const { MessageAttachment } = require('discord.js');

const { ALIGNMENT, COLOURS, STYLE, RESOLUTION } = require('./renderingConstants');
const { Rect, TextBox, Icon, Label, ProgressBar } = require('./CanvasWrapper');

Canvas.registerFont('./commands/levels/UserLevelCard/fonts/Inter/static/Inter-Bold.ttf', {family: 'Inter', weight: 'Bold'});
Canvas.registerFont('./commands/levels/UserLevelCard/fonts/Inter/static/Inter-Regular.ttf', {family: 'Inter', weight: 'Regular'});


class UserLevelCards {

	static assets = {};

	static loadAssets(path) {
		const endPath = path.slice(0, -9) + "/UserLevelCard/assets"
		let assets = {};

		fs.readdir(endPath, (err, files) => {
			files.forEach(file => {
				const img = new Canvas.Image()
				img.src = endPath + '/' + file;
				assets[file.split('.')[0]] = img;
			});
		});

		return assets;
	}

	/**
	 *
	 * @param {string} path Путь до модуля levels
	 */
	constructor(path) {
		UserLevelCards.assets = UserLevelCards.loadAssets(path);
		this.canvas = Canvas.createCanvas(RESOLUTION.CARD_WIDTH, RESOLUTION.CARD_HEIGHT);

		this.mainBackground = new Rect(
		  this.canvas,
		  0, 0, RESOLUTION.CARD_WIDTH, RESOLUTION.CARD_HEIGHT,
		  ALIGNMENT.TOP_LEFT, COLOURS.DARK_GRAY, STYLE.ROUNDING
		)

		this.bannerCoverRect = new Rect(
		  this.canvas,
		  0, STYLE.AVATAR_SHIFT + STYLE.AVATAR_SIZE / 2,
		  RESOLUTION.CARD_WIDTH, RESOLUTION.CARD_HEIGHT - STYLE.AVATAR_SHIFT - STYLE.AVATAR_SIZE / 2,
		  ALIGNMENT.TOP_LEFT, COLOURS.DARK_GRAY, [0, 0, STYLE.ROUNDING, STYLE.ROUNDING]
		)

		this.darkBackground = new Rect(
		  this.canvas,
		  STYLE.BORDER_SIZE,
		  STYLE.BORDER_SIZE,
		  RESOLUTION.CARD_WIDTH - STYLE.BORDER_SIZE * 2,
		  RESOLUTION.CARD_HEIGHT - STYLE.BORDER_SIZE * 2,
		  ALIGNMENT.TOP_LEFT, COLOURS.BLACK, STYLE.ROUNDING / 2
		)

		this.displayname = new TextBox(this.canvas,
			0, 0, 1, 1, ALIGNMENT.TOP_LEFT
		)

		this.username = new TextBox(this.canvas,
		  0, 0, 1, 1, ALIGNMENT.TOP_LEFT
		)

		this.expText = new TextBox(this.canvas,
		  0, 0, 1, 1, ALIGNMENT.TOP_CENTER
		)

		this.avatar = new Icon(this.canvas, undefined,
			STYLE.BORDER_SIZE,
			STYLE.AVATAR_SHIFT,
			STYLE.AVATAR_SIZE,
			STYLE.AVATAR_SIZE
		);

		this.avatarBackground = new Rect(this.canvas,
		  STYLE.BORDER_SIZE - STYLE.AVATAR_BG_BORDER,
		  STYLE.AVATAR_SHIFT - STYLE.AVATAR_BG_BORDER,
		  STYLE.AVATAR_SIZE + STYLE.AVATAR_BG_BORDER * 2,
		  STYLE.AVATAR_SIZE + STYLE.AVATAR_BG_BORDER * 2,
		  ALIGNMENT.TOP_LEFT, COLOURS.DARK_GRAY, (STYLE.AVATAR_SIZE + STYLE.AVATAR_BG_BORDER * 2) / 2
		);

		this.banner = new Icon(this.canvas, undefined,
		  0,
		  0,
		  RESOLUTION.CARD_WIDTH,
		  STYLE.AVATAR_SHIFT + STYLE.AVATAR_SIZE / 2,
		);

		this.progressbar = new ProgressBar(this.canvas,
		  0, 0, STYLE.PROGRESSBAR_WIDTH, STYLE.PROGRESSBAR_HEIGHT,
		  ALIGNMENT.TOP_LEFT, COLOURS.DARK_GRAY, STYLE.PROGRESSBAR_ROUNDING
		);

		this.lvlLabel = new Label(this.canvas, 0, 0, 1, 1, ALIGNMENT.TOP_RIGHT, COLOURS.BLACK, STYLE.ROUNDING/2);
	}

	generateProgressbar(userLevel) {
		this.progressbar.context.textBaseline = "hanging";
		this.progressbar
		  .moveToObject(this.displayname)
		  .move(0, STYLE.PROGRESSBAR_SHIFT);

		this.progressbar.currLvlTxt.fontSize = STYLE.ROLE_LIMIT_FONT_SIZE
		this.progressbar.currLvlTxt.font = 'Inter Bold'

		this.progressbar.nxtLvlTxt.fontSize = STYLE.ROLE_LIMIT_FONT_SIZE
		this.progressbar.nxtLvlTxt.font = 'Inter Bold'

		this.progressbar.applyToUser(userLevel);

		this.progressbar.maxLvl.asset = UserLevelCards.assets['tada']
		this.progressbar.draw();
	}

	generateUsername(userLevel) {
		this.displayname.fontSize = STYLE.USERNAME_MAX_FONT_SIZE;
		this.displayname.changeText(userLevel.member.displayName, STYLE.USERNAME_MAX_WIDTH, STYLE.USERNAME_MAX_FONT_SIZE);
		this.displayname.context.textBaseline = "alphabetic";
		this.displayname.font = 'Inter Bold'
		this.displayname
			.moveToObject(this.darkBackground)
			.move(
			  STYLE.DARK_BACKGROUND_INNER_SHIFT,
			  STYLE.DARK_BACKGROUND_INNER_SHIFT*1.5
			  + this.displayname.context.measureText(this.displayname.text)
				.actualBoundingBoxAscent
			);

		this.displayname.draw(STYLE.USERNAME_MAX_WIDTH);

		this.username.changeText(userLevel.member.user.username, RESOLUTION.CARD_WIDTH - STYLE.USERNAME_MAX_WIDTH, STYLE.USERNAME_MAX_FONT_SIZE - 15);
		this.username.context.textBaseline = "alphabetic";
		this.displayname.font = 'Inter'
		this.username
		  .moveToObject(this.displayname)
		  .move(STYLE.DARK_BACKGROUND_INNER_SHIFT + this.displayname.w);

		this.username.color = COLOURS.GRAY;
		this.username.draw(STYLE.USERNAME_MAX_WIDTH);

	}

	async generateExpValues(userLevel) {
		this.expText.fontSize = STYLE.USERNAME_MAX_FONT_SIZE + 15;
		this.expText.font = 'Inter Bold'
		this.expText.changeText(userLevel.getExpFull().toLocaleString().replaceAll(' ', '.'));
		this.expText
		  .moveToObject(this.progressbar)
		  .move(0, - this.expText.h - STYLE.PROGRESSBAR_SHIFT_UP);
		this.expText.draw();
	}

	async generateAvatar(userLevel) {
		await this.avatar.loadAssetFromUrl(
		  userLevel.member.displayAvatarURL({format: 'png', size: 4096})
		);

		this.avatarBackground.draw();

		this.avatar
		  .makeRounded()
		  .draw();
	}

	generateDarkBackground() {
		this.darkBackground
		  .moveToObject(this.avatar)
		  .move(0, this.avatar.h + STYLE.DARK_BACKGROUND_SHIFT);

		this.darkBackground.h =
		  RESOLUTION.CARD_HEIGHT - this.darkBackground.y - STYLE.BORDER_SIZE;

		this.darkBackground.draw();
	}

	async generateBanner(userLevel) {
		const bannerAllowedHeight = STYLE.AVATAR_SIZE / 2 + STYLE.AVATAR_SHIFT;
		this.banner.asset = UserLevelCards.assets['default_banner']
		this.banner.w = RESOLUTION.CARD_WIDTH;

		if (userLevel.member.id == '500020124515041283') {
			await this.banner.loadAssetFromUrl('https://cdn.discordapp.com/attachments/1039311543894020156/1137303337516142682/FkGKh77aAAI7UOy.jpg');
		}

		this.banner.useOriginalAspect();
		if (this.banner.h < bannerAllowedHeight){
			this.banner.h = bannerAllowedHeight;
			this.banner.useOriginalAspect(true);
		}

		this.banner.alignment = ALIGNMENT.CENTER_CENTER;

		this.banner
		  .moveToPoint(RESOLUTION.CARD_WIDTH / 2, bannerAllowedHeight / 2);

		this.banner.makeRounded([STYLE.ROUNDING, STYLE.ROUNDING, 0, 0])
		this.banner.draw();
	}

	generateCurrLevelLabel(userLevel) {
		this.lvlLabel
		  .setIcon(new Icon(
			this.canvas, undefined,
			0, 0, 40, 40
		  ));

		this.lvlLabel.icon.asset = UserLevelCards.assets[
		  userLevel.getRole().cache.name
			.toLowerCase()
			.replace(' ', '_')
		  ]
		this.lvlLabel.icon.useOriginalAspect();

		this.lvlLabel.primaryText.changeText(userLevel.getRole().cache.name, 150, 31)

		this.lvlLabel.reposElements();
		this.lvlLabel.move(-this.lvlLabel.h);

		this.lvlLabel
		  .moveToObject(this.darkBackground)
		  .move(0, -this.lvlLabel.h - STYLE.DARK_BACKGROUND_SHIFT);

		this.lvlLabel.draw();
	}

	async generate(userLevel) {
		const context = this.canvas.getContext('2d');
		context.textBaseline = "top";

		this.mainBackground.draw();

		await this.generateBanner(userLevel);

		this.bannerCoverRect.draw();

		this.generateDarkBackground();

		await this.generateAvatar(userLevel);

		this.generateUsername(userLevel);

		this.generateProgressbar(userLevel);

		await this.generateExpValues(userLevel);

		this.generateCurrLevelLabel(userLevel);

		return new MessageAttachment(this.canvas.toBuffer('image/png'), `${userLevel.getExp()}.png`);
	}

}

module.exports = UserLevelCards