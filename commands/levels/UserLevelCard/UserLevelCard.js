const Canvas = require('canvas');
const fs = require('fs');
const { MessageAttachment, Snowflake } = require('discord.js');

const { ALIGNMENT, COLOURS, STYLE, RESOLUTION } = require('./renderingConstants');
const { Rect, TextBox, Icon, Label, ProgressBar } = require('./CanvasWrapper');
const { UserLevels } = require('../UserLevels');

const GifEncoder = require('gif-encoder');
const { streamToBuffer } = require('@jorgeferrero/stream-to-buffer');
const { loadImage, createCanvas } = require('canvas');
const gifFrames = require('gif-frames');

const fontsRoot = './commands/levels/UserLevelCard/fonts/'

Canvas.registerFont(fontsRoot + 'Inter/static/Inter-Bold.ttf', {family: 'Inter', weight: 'Bold'});
Canvas.registerFont(fontsRoot + 'Inter/static/Inter-Light.ttf', {family: 'Inter', weight: 'Light'});
Canvas.registerFont(fontsRoot + 'PT_Sans/PTSans-Regular.ttf', {family: 'Sans', weight: 'Regular'});
Canvas.registerFont(fontsRoot + 'Montserrat/static/Montserrat-Medium.ttf', {family: 'Montserrat', weight: 'Medium'});
Canvas.registerFont(fontsRoot + 'Montserrat/static/Montserrat-Bold.ttf', {family: 'Montserrat', weight: 'Bold'});


class UserLevelCards {

	static assets = {};
	static cachedImages = {
	};

	/**
	 *
	 * @type {{Snowflake: {userLevel: UserLevels, card: Canvas}}}
	 */
	static cachedCards = {
	};

	static #cachedUserLevelCards = {
	};

	static getCachedCard(id) {
		return UserLevelCards.cachedCards[id];
	}

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

	constructor() {
		this.canvas = Canvas.createCanvas(RESOLUTION.CARD_WIDTH, RESOLUTION.CARD_HEIGHT);

		this.mainBackground = new Rect(
		  this.canvas,
		  0, 0, RESOLUTION.CARD_WIDTH, RESOLUTION.CARD_HEIGHT,
		  ALIGNMENT.TOP_LEFT, COLOURS.DARK_GRAY, STYLE.ROUNDING
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

		this.lvlLabel = new Label(this.canvas, 0, 0, 1, 1, ALIGNMENT.TOP_RIGHT, COLOURS.BLACK, STYLE.ROUNDING / 2);

		this.msgAll = new Label(
		  this.canvas, 0, 0, 1, 1,
		  ALIGNMENT.TOP_RIGHT, COLOURS.DARK_GRAY, STYLE.ROUNDING / 4
		);
		this.msgAll.faceShift *= 1.5;
		this.msgAll
		  .setIcon(new Icon(this.canvas, undefined,0, 0, 40, 40))
		  .setSecondaryText(new TextBox(this.canvas, 0, 0, 1, 1));
		this.msgAll.secondaryText.color = COLOURS.GRAY;
		this.msgAll.secondaryText.changeText('Всего', 150, STYLE.LABEL_STATS_SECONDARY_FONT_SIZE);

		this.msgAvg = new Label(
		  this.canvas, 0, 0, 1, 1,
		  ALIGNMENT.TOP_RIGHT, COLOURS.DARK_GRAY, STYLE.ROUNDING / 4
		);
		this.msgAvg.faceShift *= 1.5;
		this.msgAvg
		  .setIcon(new Icon(this.canvas, undefined,0, 0, 40, 40))
		  .setSecondaryText(new TextBox(this.canvas, 0, 0, 1, 1));
		this.msgAvg.secondaryText.color = COLOURS.GRAY;
		this.msgAvg.secondaryText.changeText('Учтено', 150, STYLE.LABEL_STATS_SECONDARY_FONT_SIZE);

		this.symAll = new Label(
		  this.canvas, 0, 0, 1, 1,
		  ALIGNMENT.TOP_RIGHT, COLOURS.DARK_GRAY, STYLE.ROUNDING / 4
		);
		this.symAll.faceShift *= 1.5;
		this.symAll
		  .setIcon(new Icon(this.canvas, undefined,0, 0, 40, 40))
		  .setSecondaryText(new TextBox(this.canvas, 0, 0, 1, 1));
		this.symAll.secondaryText.color = COLOURS.GRAY;
		this.symAll.secondaryText.changeText('Всего', 150, STYLE.LABEL_STATS_SECONDARY_FONT_SIZE);

		this.symAvg = new Label(
		  this.canvas, 0, 0, 1, 1,
		  ALIGNMENT.TOP_RIGHT, COLOURS.DARK_GRAY, STYLE.ROUNDING / 4
		);
		this.symAvg.faceShift *= 1.5;
		this.symAvg
		  .setIcon(new Icon(this.canvas, undefined,0, 0, 40, 40))
		  .setSecondaryText(new TextBox(this.canvas, 0, 0, 1, 1));
		this.symAvg.secondaryText.color = COLOURS.GRAY;
		this.symAvg.secondaryText.changeText('Среднее', 150, STYLE.LABEL_STATS_SECONDARY_FONT_SIZE);

		this.overpost = new Label(
		  this.canvas, 0, 0, 1, 1,
		  ALIGNMENT.TOP_RIGHT, COLOURS.DARK_GRAY, STYLE.ROUNDING / 4
		);
		this.overpost.faceShift *= 1.5;
		this.overpost
		  .setIcon(new Icon(this.canvas, undefined,0, 0, 40, 40))
		  .setSecondaryText(new TextBox(this.canvas, 0, 0, 1, 1));
		this.overpost.secondaryText.color = COLOURS.GRAY;
		this.overpost.secondaryText.changeText('Оверпост', 150, STYLE.LABEL_STATS_SECONDARY_FONT_SIZE);

		this.activity = new Label(
		  this.canvas, 0, 0, 1, 1,
		  ALIGNMENT.TOP_RIGHT, COLOURS.DARK_GRAY, STYLE.ROUNDING / 4
		);
		this.activity.faceShift *= 1.5;
		this.activity
		  .setIcon(new Icon(this.canvas, undefined,0, 0, 40, 40))
		  .setSecondaryText(new TextBox(this.canvas, 0, 0, 1, 1));
		this.activity.secondaryText.color = COLOURS.GRAY;
	}

	generateProgressbar(userLevel) {
		this.progressbar.context.textBaseline = "hanging";
		this.progressbar
		  .moveToObject(this.displayname)
		  .move(0, STYLE.PROGRESSBAR_SHIFT);

		this.progressbar.currLvlTxt.fontSize = STYLE.ROLE_LIMIT_FONT_SIZE
		this.progressbar.currLvlTxt.font = 'Montserrat Medium'

		this.progressbar.nxtLvlTxt.fontSize = STYLE.ROLE_LIMIT_FONT_SIZE
		this.progressbar.nxtLvlTxt.font = 'Montserrat Medium'

		this.progressbar.applyToUser(userLevel);

		this.progressbar.maxLvl.asset = UserLevelCards.assets['tada']
		this.progressbar.draw();
	}

	generateUsername(userLevel) {
		this.displayname.fontSize = STYLE.USERNAME_MAX_FONT_SIZE;
		this.displayname.changeText(userLevel.member.displayName.truncate(19), STYLE.USERNAME_MAX_WIDTH, STYLE.USERNAME_MAX_FONT_SIZE);
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

		this.username.changeText(userLevel.member.user.username.truncate(14), RESOLUTION.CARD_WIDTH - STYLE.USERNAME_MAX_WIDTH, STYLE.USERNAME_MAX_FONT_SIZE - 15);
		this.username.context.textBaseline = "alphabetic";
		this.username.font = 'Inter Regular'
		this.username
		  .moveToObject(this.displayname)
		  .move(STYLE.DARK_BACKGROUND_INNER_SHIFT + this.displayname.w);

		this.username.color = COLOURS.GRAY;
		this.username.draw(STYLE.USERNAME_MAX_WIDTH);

	}

	async generateExpValues(userLevel) {
		this.expText.fontSize = STYLE.USERNAME_MAX_FONT_SIZE + 15;
		this.expText.font = 'Montserrat Bold'
		this.expText.changeText(userLevel.getExpFull().toLocaleString().replaceAll(' ', '.').replaceAll(',', '.'));
		this.expText
		  .moveToObject(this.progressbar)
		  .move(0, - this.expText.h - STYLE.PROGRESSBAR_SHIFT_UP);
		this.expText.draw();
	}

	async generateAvatar(userLevel) {
		const cachedAvatar = await UserLevelCards.cachedImages.avatars.getAsJson(userLevel.member.id);
		const currentAvatarUrl = userLevel.member.displayAvatarURL({format: 'png', size: 1024, dynamic: userLevel.flags.animatedMediaContentEnabled});

		if (cachedAvatar && (currentAvatarUrl === cachedAvatar.avatarUrl)) {
			this.avatar.asset = await loadImage(Buffer.from(cachedAvatar.asset, 'base64'));
			if (cachedAvatar.gif)
			this.avatar.gif = await gifFrames(
			  { url: Buffer.from(cachedAvatar.gif, 'base64'), frames: 'all', outputType: 'png' });
			userLevel.isAvatarCached = true;
		} else {
			await this.avatar.loadAssetFromUrl(currentAvatarUrl);
			UserLevelCards.cachedImages.avatars.setAsJson(userLevel.member.id,{
				asset: this.avatar.buffer?.toString('base64'),
				gif: this.avatar.gifbuffer?.toString('base64'),
				avatarUrl: currentAvatarUrl
			});
		}

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
		const cachedBanner = await UserLevelCards.cachedImages.banners.getAsJson(userLevel.member.id);
		const currentBannerUrl = userLevel.getBannerUrl(userLevel.flags.animatedMediaContentEnabled);

		this.banner.asset = UserLevelCards.assets['default_banner'];
		userLevel.isBannerCached = true;
		this.banner.w = RESOLUTION.CARD_WIDTH;

		if (currentBannerUrl) {
			if ((cachedBanner?.asset || cachedBanner?.gif)&& (currentBannerUrl === cachedBanner.bannerUrl)) {
				this.banner.asset = await loadImage(Buffer.from(cachedBanner.asset, 'base64'));
				if (cachedBanner.gif)
				this.banner.gif = await gifFrames(
				  { url: Buffer.from(cachedBanner.gif, 'base64'), frames: 'all', outputType: 'png' }
				);
			} else {
				userLevel.isBannerCached = false;
				await this.banner.loadAssetFromUrl(currentBannerUrl);
				UserLevelCards.cachedImages.banners.setAsJson(userLevel.member.id, {
					asset: this.banner.buffer?.toString('base64'),
					bannerUrl: currentBannerUrl,
					gif: this.banner.gifbuffer?.toString('base64')
				});
			}
		}

		this.banner.useOriginalAspect();
		if (this.banner.h < bannerAllowedHeight){
			this.banner.h = bannerAllowedHeight;
			this.banner.useOriginalAspect(true);
		}

		this.banner.alignment = ALIGNMENT.CENTER_CENTER;

		this.banner
		  .moveToPoint(RESOLUTION.CARD_WIDTH / 2, bannerAllowedHeight / 2);

		this.banner.makeRounded([STYLE.ROUNDING, STYLE.ROUNDING, 0, 0], [0, RESOLUTION.CARD_WIDTH, 0, STYLE.AVATAR_SIZE / 2 + STYLE.AVATAR_SHIFT])
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
		this.lvlLabel.primaryText.font = 'Montserrat Medium'
		this.lvlLabel.primaryText.changeText(userLevel.getRole().cache.name, 170, STYLE.LABEL_ROLE_FONT_SIZE)

		this.lvlLabel.reposElements();
		this.lvlLabel.move(-this.lvlLabel.h);

		this.lvlLabel
		  .moveToObject(this.darkBackground)
		  .move(0, -this.lvlLabel.h - STYLE.DARK_BACKGROUND_SHIFT);

		this.lvlLabel.draw();
	}

	generateStats(userLevel) {
		this.generateMsgAll(userLevel);
		this.generateMsgAvg(userLevel);
		this.generateSymAll(userLevel);
		this.generateSymAvg(userLevel);
		this.generateOverpost(userLevel);
		this.generateActivity(userLevel);
	}

	generateMsgAll(userLevel) {

		this.msgAll.icon.asset = UserLevelCards.assets['messages'];
		this.msgAll.icon.useOriginalAspect();


		this.msgAll.primaryText.changeText(
		  userLevel.getMessagesAll()
			.toLocaleString().replaceAll(' ', '.').replaceAll(',', '.'), 150, STYLE.LABEL_STATS_PRIMARY_FONT_SIZE
		);


		this.msgAll.reposElements();
		this.msgAll.alignment = ALIGNMENT.BOTTOM_LEFT;
		this.msgAll
		  .moveToObject(this.progressbar.currLvlTxt)
		  .move(0, this.msgAll.h + STYLE.STATS_GRID_SHIFT);

		this.msgAll.draw();
	}

	generateMsgAvg(userLevel) {

		this.msgAvg.icon.asset = UserLevelCards.assets['messages'];
		this.msgAvg.icon.useOriginalAspect();


		this.msgAvg.primaryText.changeText(
		  userLevel.getMessagesLegit()
			.toLocaleString().replaceAll(' ', '.').replaceAll(',', '.'),150, STYLE.LABEL_STATS_PRIMARY_FONT_SIZE
		);


		this.msgAvg.reposElements();
		this.msgAvg.alignment = ALIGNMENT.TOP_LEFT;
		this.msgAvg
		  .moveToObject(this.msgAll)
		  .move(this.msgAll.w + STYLE.STATS_GRID_GAP, 0);

		this.msgAvg.draw();
	}

	generateSymAll(userLevel) {

		this.symAll.icon.asset = UserLevelCards.assets['symbols'];
		this.symAll.icon.useOriginalAspect();


		this.symAll.primaryText.changeText(
		  userLevel.getSymbols()
			.toLocaleString().replaceAll(' ', '.').replaceAll(',', '.'),150, STYLE.LABEL_STATS_PRIMARY_FONT_SIZE
		);


		this.symAll.reposElements();
		this.symAll.alignment = ALIGNMENT.TOP_LEFT;
		this.symAll
		  .moveToObject(this.msgAll)
		  .move(0, this.msgAll.h + STYLE.STATS_GRID_GAP);

		this.symAll.draw();
	}

	generateSymAvg(userLevel) {

		this.symAvg.icon.asset = UserLevelCards.assets['symbols'];
		this.symAvg.icon.useOriginalAspect();


		this.symAvg.primaryText.changeText(
		  userLevel.getSymbolsAvg()
			.toLocaleString().replaceAll(' ', '.').replaceAll('.', ','),150, STYLE.LABEL_STATS_PRIMARY_FONT_SIZE
		);


		this.symAvg.reposElements();
		this.symAvg.alignment = ALIGNMENT.TOP_LEFT;
		this.symAvg
		  .moveToObject(this.symAll)
		  .move(this.symAll.w + STYLE.STATS_GRID_GAP, 0);

		this.symAvg.draw();
	}

	generateOverpost(userLevel) {

		this.overpost.icon.asset = UserLevelCards.assets['overpost'];
		this.overpost.icon.useOriginalAspect();


		this.overpost.primaryText.changeText(
		  (userLevel.getOverpost() + '%').replaceAll('.', ',') ,150, 31
		);

		this.overpost.reposElements();
		this.overpost.alignment = ALIGNMENT.TOP_LEFT;
		this.overpost
		  .moveToObject(this.symAll)
		  .move(0, this.symAll.h + STYLE.STATS_GRID_GAP);

		this.overpost.draw();
	}

    generateActivity(userLevel) {

        this.activity.icon.asset = UserLevelCards.assets['activity'];
        this.activity.icon.useOriginalAspect();


        this.activity.primaryText.changeText(
            userLevel.getActivity() + '/30 дней',150, STYLE.LABEL_STATS_PRIMARY_FONT_SIZE
        );
        this.activity.secondaryText.changeText(
            userLevel.getActivityPer() + '%',150, STYLE.LABEL_STATS_SECONDARY_FONT_SIZE
        );

        this.activity.reposElements();
        this.activity.alignment = ALIGNMENT.TOP_LEFT;
        this.activity
            .moveToObject(this.overpost)
            .move(0, this.overpost.h + STYLE.STATS_GRID_GAP);

        this.activity.draw();
    }

	/**
	 * @param {Canvas} canvas
	 * @param {userLevel} userLevel
	 * @param {String} time
	 */
	generateTime(canvas, userLevel, time) {
		const footerBackground = new Rect(canvas, 0, 0, 1, 1,
		  ALIGNMENT.BOTTOM_LEFT, COLOURS.BLACK
		);

		this.footer = new TextBox(canvas, 0, 0, 1, 1,
		  ALIGNMENT.BOTTOM_LEFT, COLOURS.DARK_GRAY,
		  '', 23
		);

		this.footer
		  .moveToObject(this.darkBackground)
		  .move(
			STYLE.DARK_BACKGROUND_INNER_SHIFT,
			-STYLE.DARK_BACKGROUND_INNER_SHIFT
		  );



		let txtCached = '';
		if (userLevel.isCachedFull) {
			txtCached = 'всё';
		} else if (userLevel.isAvatarCached && userLevel.isBannerCached) {
			txtCached = 'аватар+баннер';
		} else if (userLevel.isAvatarCached) {
			txtCached = 'аватар';
		} else if (userLevel.isBannerCached) {
			txtCached = 'баннер';
		} else {
			txtCached = 'нет'
		}

		const txt = `Сгенерировано за: ${round(getMilliseconds() - time, 1)}мс. Кеш: ${txtCached}`

		this.footer.font = 'Montserrat Medium'
		this.footer.changeText(txt, undefined, 23);

		footerBackground.h = this.footer.h;
		footerBackground.w = RESOLUTION.CARD_WIDTH - (STYLE.BORDER_SIZE * 2 + STYLE.DARK_BACKGROUND_INNER_SHIFT) ;

		footerBackground.moveToObject(this.footer);
		footerBackground.draw();
		this.footer.draw();
	}

	/**
	 *
	 * @param {Canvas} canvas
	 * @param {UserLevels} userLevel
	 * @param {Interaction} int
	 * @returns {GIFEncoder|null}
	 */
	async animate(canvas, userLevel, int=undefined) {
		const ctx = canvas.getContext('2d');
		let aGif;
		let bGif;
		let aGifDelay = 0
		let bGifDelay = 0
		let aGifLength = 0
		let bGifLength = 0


		if (!userLevel.isAnimated()) return null;
		if ((!this.avatar.gif && !this.banner.gif) || !userLevel.flags.animatedMediaContentEnabled) return null;

		if (this.avatar.gif) {
			aGif = this.avatar.gif;
			aGifDelay = aGif[0].frameInfo.delay;
			aGifLength = aGif.length;
		}
		if (this.banner.gif) {
			bGif = this.banner.gif;
			bGifDelay = bGif[0].frameInfo.delay;
			bGifLength = bGif.length;
		}

		const frameTime = Math.min(aGif ? aGifDelay : bGifDelay, bGif ? bGifDelay : aGifDelay);
		const aGifFullTime = aGifDelay * aGifLength;
		const bGifFullTime = bGifDelay * bGifLength;
		const fullTime = Math.max(aGifFullTime, bGifFullTime);

		const aGifAllowedTime = aGif ? (Math.floor((fullTime + frameTime)/aGifFullTime) * aGifFullTime) : fullTime;
		const bGifAllowedTime = bGif ? (Math.floor((fullTime + frameTime)/bGifFullTime) * bGifFullTime) : fullTime;

		const gif = new GifEncoder(canvas.width, canvas.height, { highWaterMark: 8 * 1000 * 1000 * 24 });
		gif.setDelay(Math.min(aGif ? aGifDelay : bGifDelay, bGif ? bGifDelay : aGifDelay) * 10);
		gif.setQuality(15);
		gif.setRepeat(0);
		gif.setTransparent(0x000000);
		gif.setDispose(0);

		gif.writeHeader();

		let aFrame = 0;
		let bFrame = 0;
		let aPreviousFrame = -1;
		let bPreviousFrame = -1;
		let currTime = 0;
		let frameTimes = [0, 0, 0];

		const gStart = Date.now();
		let previousIntSend = 0;

		for (let frame = 0; (currTime < fullTime); frame++) {
			const fStart = getMilliseconds();
			//console.time('drawAssets in')
			if (aGif) {
				aFrame = Math.floor(Math.min(aGifAllowedTime, currTime) / aGifDelay) % aGifLength;
				if (aPreviousFrame != aFrame) {
					aPreviousFrame = aFrame;

					if(this.avatar.cachedGifFrames?.[aFrame]){
						this.avatar.asset = this.avatar.cachedGifFrames[aFrame];
					} else {
						this.avatar.asset = await Canvas.loadImage(
						  await streamToBuffer(aGif[aFrame].getImage())
						);
						//this.avatar.cachedGifFrames[aFrame] = this.avatar.asset;
					}
					this.avatar.context = canvas.getContext('2d');
					this.avatar.makeRounded();
					this.avatar.draw(ctx);
				}
			}
			if (bGif) {
				bFrame = Math.floor(Math.min(bGifAllowedTime, currTime) / bGifDelay) % bGifLength;
				if (bPreviousFrame != bFrame) {
					bPreviousFrame = bFrame;

					if (this.banner.cachedGifFrames?.[bFrame]) {
						this.banner.asset = this.banner.cachedGifFrames[bFrame];
					} else {
						this.banner.asset = await Canvas.loadImage(
						  await streamToBuffer(bGif[bFrame].getImage())
						);
						//this.banner.cachedGifFrames[bFrame] = this.banner.asset;
					}
					this.banner.context = canvas.getContext('2d');
					this.banner.makeRounded(
					  [STYLE.ROUNDING, STYLE.ROUNDING, 0, 0], [
						  0,
						  RESOLUTION.CARD_WIDTH,
						  0,
						  STYLE.AVATAR_SIZE / 2 + STYLE.AVATAR_SHIFT
					  ]);
					this.banner.draw(ctx);
				}
			}
			//console.timeEnd('drawAssets in')

			currTime += frameTime;

			//console.time('addFrame in')
			gif.addFrame(ctx.getImageData(0, 0, canvas.width, canvas.height).data);
			//console.timeEnd('addFrame in')

			const fTime = round(getMilliseconds() - fStart, 3);
			frameTimes.unshift(fTime);
			const pTime = round(Date.now() - gStart, 3);
			const avgTime = pTime/frame;
			const avgByP3 = (frameTimes[0] + frameTimes[1] + frameTimes[2]) / 3;
			const speed = round( 1000 / avgByP3, 1);
			const reTime = round((((fullTime - currTime)/frameTime)*avgByP3)/1000, 3);
			const gRe = round(((fullTime/frameTime)*avgTime)/1000);

			process.stdout.write(
			  this.getPlaneTextProgressBar(
				currTime/fullTime,
				20
			  ) + ' ' + aFrame + ' ' + bFrame + ' | Passed:' + (pTime/1000).toFixed(3) + 's; ETA:' + reTime + 's; Speed: ' + speed + ' frames/s'
			 + ' '.repeat(10) + '\r'
			);

			if (int?.deferred && (Math.round((getMilliseconds() - previousIntSend)/1000) >= 2)) {
				previousIntSend = getMilliseconds();
				int.editReply(
					{
						content: '`' + this.getPlaneTextProgressBar(currTime/fullTime,20, true)
						  + ('` Прошло: <t:' + Math.floor(gStart/1000) + ':R> Осталось: <t:' + Math.floor(gStart/1000 + gRe + 2) + ':R>')

					}
				)
			}
		}

		console.log('')
		gif.finish();

		return gif;
	}

	/**
	 *
	 * @param {number} progress Прогресс. от 0.0 до 1.0
	 * @param {number} length	Длинна полоски. ПО умолчанию 20 символов
	 * @param {boolean} toDiscord Строка которая будет добавлена после прогресс
	 *   бара
	 * @return {string}
	 */
	getPlaneTextProgressBar(progress, length=20, toDiscord=false) {
		progress = Math.max(Math.min(progress, 1), 0)

		const pr = '▉'.repeat(Math.round(progress * length));
		const re = (toDiscord ? 'ㅤ' : ' ').repeat(Math.round((1 - progress) * length));

		return '[' + pr + re + ']';
	}

	static async generate(userLevel, int) {
		return await (new UserLevelCards()).generate(userLevel, int);
	}

    async generate(userLevel, int) {
		const gStart = getMilliseconds();

		if (userLevel.isCached() && !userLevel.isAnimated()) {
			const buffer = await UserLevelCards.cachedImages.cards.get(userLevel.member.id + '.png');
			if(buffer) {
				const img = await loadImage(buffer)
				const canvas = createCanvas(
				  RESOLUTION.CARD_WIDTH, RESOLUTION.CARD_HEIGHT)
				const ctx = canvas.getContext('2d')
				ctx.drawImage(
				  img, 0, 0, RESOLUTION.CARD_WIDTH, RESOLUTION.CARD_HEIGHT)
				userLevel.isCachedFull = true;
				this.generateTime(canvas, userLevel, gStart);

				return new MessageAttachment(
				  canvas.toBuffer('image/png'), `${userLevel.getExp()}.png`);
			}
		}

		if (userLevel.isGifCached() && userLevel.isAnimated()) {
			const buffer = await UserLevelCards.cachedImages.cards.get(userLevel.member.id + '.gif');
			return new MessageAttachment(buffer, `${userLevel.getExp()}.gif`);
		}

		this.mainBackground.draw();

		await this.generateBanner(userLevel);

		this.generateDarkBackground();

		await this.generateAvatar(userLevel);

		this.generateUsername(userLevel);

		this.generateProgressbar(userLevel);

		await this.generateExpValues(userLevel);

		this.generateCurrLevelLabel(userLevel);

		this.generateStats(userLevel);

		this.generateTime(this.canvas, userLevel, gStart);

		const gif = await this.animate(copyCanvas(this.canvas), userLevel, int);

		UserLevelCards.cachedCards[userLevel.member.id] = {userLevel:userLevel}

		if (gif) {
			const buffer = gif.read()
			UserLevelCards.cachedCards[userLevel.member.id] = {userLevel:userLevel, gif: true}
			UserLevelCards.cachedImages.cards.set(userLevel.member.id + '.gif', buffer)
			return new MessageAttachment(buffer, `${userLevel.getExp()}.gif`);
		}

		const buffer = this.canvas.toBuffer('image/png')

		UserLevelCards.cachedImages.cards.set(userLevel.member.id + '.png', buffer)

		return new MessageAttachment(buffer, `${userLevel.getExp()}.png`);
	}

}

module.exports = UserLevelCards