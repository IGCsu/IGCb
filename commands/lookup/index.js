const SlashOptions = require('../../BaseClasses/SlashOptions');
const BaseCommand = require('../../BaseClasses/BaseCommand');
const LangSingle = require('../../BaseClasses/LangSingle');
const {
	MessageEmbed,
	CommandInteraction,
	UserContextMenuInteraction
} = require('discord.js');

const slashOptions = require('./slashOptions');
const { title, description } = require('./about.json');
const dateText = require('./dateText.json');

class Lookup extends BaseCommand {

	constructor (path) {
		super(path);

		this.category = 'Информация';
		this.name = 'lookup';
		this.title = new LangSingle(title);
		this.description = new LangSingle(description);
		this.slashOptions = slashOptions;

		this.dateText = dateText;

		return new Promise(async resolve => {
			resolve(this);
		});
	}

	/**
	 * Собирает всю инфу о пользователе, формирует эмбед и возвращает его
	 *
	 * @param {string} id ID пользователя
	 * @return {MessageEmbed}
	 */
	async call (id) {
		const user = await client.users.fetch(id);
		let member = undefined;

		try {
			member = await guild.members.fetch(id);
		} catch (e) { }

		const embed = new Discord.MessageEmbed();

		const now = Date.now();

		let text = 'Бот: ' + (user.bot ? 'да' : 'нет');
		text += '\nАккаунт зарегистрирован: ' +
			this.getDateFromNow(now - user.createdTimestamp);
		text += '\nТочная дата: ' + user.createdAt.toUTCString();

		if (member) {
			text += '\n\nПрисоединился к сообществу: ' +
				this.getDateFromNow(now - member.joinedTimestamp);
			text += '\nТочная дата: ' + member.joinedAt.toUTCString();
			if (member.nickname) text += '\nНик в сообществе: ' + member.nickname;
			embed.setColor(member.displayColor);
		}
		embed.setThumbnail(user.avatarURL({ dynamic: true }));
		embed.setTitle(user.tag);
		embed.setDescription(text);

		return embed;
	}

	/**
	 * Обработка слеш-команды
	 * @param {CommandInteraction} int Команда пользователя
	 */
	async slash (int) {
		try {
			const id = int.options.get('id').value;
			const embed = await this.call(
				id.replace(/[^-_\w]/g, ' ').match(/[0-9]+/g)[0]
			);
			int.reply({ embeds: [embed] });
		} catch (e) {
			int.reply({
				content: reaction.emoji.error + ' ' + int.str('User not found'),
				ephemeral: true
			});
			console.log(e);
		}
	}

	/**
	 *
	 * @param {UserContextMenuInteraction} int
	 * @return {Promise<void>}
	 */
	async contextUser (int) {
		try {
			const id = int.targetId;
			const embed = await this.call(
				id.replace(/[^-_\w]/g, ' ')
					.match(/[0-9]+/g)[0]
			);
			int.reply({ embeds: [embed], ephemeral: true });
		} catch (e) {
			int.reply({
				content: reaction.emoji.error + ' ' + int.str('User not found'),
				ephemeral: true
			});
			console.log(e);
		}
	}


	/**
	 * Получение разницы меж датами
	 *
	 * @return {String}
	 * @param {Number} difference
	 */
	getDateFromNow (difference) {
		difference = difference / 1000;

		const minutes = Math.round((difference / 60) % 60);
		const hours = Math.round((difference / 3600) % 24);
		const days = Math.round(difference / 86400);
		const month = +(days / 30).toFixed(1);
		const year = +(days / 365).toFixed(1);

		if (days === 0) {
			if (hours > 0) {
				return hours + ' ' + num2str(hours, this.dateText.hours) + ' назад';
			}
			if (minutes > 0) {
				return minutes + ' ' + num2str(minutes, this.dateText.minutes) +
					' назад';
			}
			return 'меньше минуты назад...';
		}

		let value = days + ' ' + num2str(days, this.dateText.days) + ' назад';

		if (year >= 1) {
			return value + ' ~ ' + year + ' ' + num2str(year, this.dateText.year) +
				' назад';
		}
		if (month >= 1) {
			return value + ' ~ ' + month + ' ' + num2str(month, this.dateText.month) +
				' назад';
		}

		return value;
	}
}

module.exports = Lookup;
