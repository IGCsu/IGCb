const SlashOptions = require('../../BaseClasses/SlashOptions');
const BaseCommand = require('../../BaseClasses/BaseCommand');
const LangSingle = require('../../BaseClasses/LangSingle');
const { GuildMember, GuildBan, User, MessageEmbed} = require('discord.js')

const { title, description } = require('./about.json');

class Ping extends BaseCommand{

	constructor(path) {
		super(path);

		this.category = 'Информация'

		this.name = 'ping'
		this.title = title
		this.description = description

		this.embed = new Discord.MessageEmbed().setDescription('Вычисление... ')

		return new Promise(async resolve => {
			resolve(this);
		});
	}

	/**
	 * Обработка команды
	 * Вычисляет пинг и время жизни бота и отправляет
	 * @param {CommandInteraction} int Команда пользователя
	 * @param {Message}            m   Сообщение бота
	 */
	async call(int, m){
		const ping = (m.createdTimestamp - int.createdTimestamp) / 2;
		const lang = int.locale.split('-')[0];

		let uptime = client.uptime / 1000;

		uptime = [
			Math.floor(uptime / 3600).toString().padStart(2, '0'),
			Math.floor(uptime % 3600 / 60).toString().padStart(2, '0'),
			Math.floor(uptime % 3600 % 60).toString().padStart(2, '0')
		];

		const embed = new Discord.MessageEmbed()
			.setTitle('Pong!')
			.setDescription(`\`${ping}ms\` Uptime: ${uptime.join(':')}\n ${this.description[lang] ?? this.description.ru}`);

		await m.edit({ embeds : [embed] });
	}

	/**
	 * Обработка слеш-команды
	 * @param {CommandInteraction} int Команда пользователя
	 */
	async slash(int){
		const m = await int.reply({ embeds : [this.embed], fetchReply: true });
		await this.call(int, m);
	}
}

module.exports = Ping;
