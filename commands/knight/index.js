const SlashOptions = require('../../BaseClasses/SlashOptions');
const BaseCommand = require('../../BaseClasses/BaseCommand');
const LangSingle = require('../../BaseClasses/LangSingle');
const { CommandInteraction } = require('discord.js');
const { title, description } = require('./about.json');

class Knight extends BaseCommand {

	constructor (path) {
		super(path);

		this.category = 'Развлечения';
		this.name = 'knight';
		this.title = new LangSingle(title);
		this.description = new LangSingle(description);
		this.slashOptions = slashOptions;

		return new Promise(async resolve => {
			resolve(this);
		});
	}

	async call (int) {
		await int.reply({ content: 'https://cdn.discordapp.com/attachments/840321892136255528/1042826882174955550/outputcompress-video-online.com.mp4' });
	}

	/**
	 * Функция обработки slash-команды.
	 * @param {CommandInteraction} int
	 */
	async slash (int) {
		await this.call(int);
	}
}

module.exports = Knight;
