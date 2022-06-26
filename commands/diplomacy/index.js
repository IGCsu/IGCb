const slashOptions = require('./slashOptions.json');
const { title } = require('./about.json')

const config = require("./gameData/config.json");

const Game = require('./Game');
const UserDiplomacy = require('./UserDiplomacy');

module.exports = {

	active: true,
	category: 'Развлечения',

	name: 'diplomacy',
	title: title,
	slashOptions: slashOptions,

	init: async function(path){

		try{
			await Game.getStatusGame(config.gameID);
		}catch(e){
			log.initText += log.error(path + ': ' + e);
			this.active = false;
			return this;
		}

		this.channel = guild.channels.cache.get(config.channel);

		setInterval(async () => {
			this.update(false, true).then(res => {
				if(res.pingList) res.data.content = res.pingList;
				this.channel.send(res.data);
			}).catch(() => {});
		}, config.interval * 1000);

		return this;

	},

	/**
	 * Обработка слеш-команды
	 * @param {CommandInteraction} int Команда пользователя
	 */
	slash: async function(int){
		const flag = int.options.getString('flag');

		await int.deferReply({
			ephemeral: flag === 'ephemeral'
		});

		this.update(true, flag === 'ping').then(async res => {
			res.data.ephemeral = flag === 'ephemeral';

			await int.editReply(res.data);

			if(res.pingList){
				await int.followUp({ content: res.pingList });
			}else if(flag === 'ping'){
				await int.followUp({
					content: reaction.emoji.error + ' ' + localize(int.locale, 'Mentions were suppressed due to the fact that too little time has passed since past mentions'),
					ephemeral: true
				});
			}
		}).catch(err => {
			int.editReply({
				content: reaction.emoji.error + ' ' + err,
				ephemeral: true
			});
		});
	},


	/**
	 * Запрос к сайту.
	 * Определяет, не случилось ли обновление хода в интервал между проверками
	 * Перебирает список игроков для выяснения их статуса. Пингует только тех, у кого ходов не сделано вообще и только в том случае, если в течении шести часов он не пинговал до этого
	 * @param  {boolean} status true - вернёт сообщение всегда. false - вернёт сообщение, только если случился новый ход.
	 * @param  {boolean} ping   true - упомянет нужных пользователей. false - упоминания не будет.
	 * @return {Object}
	 */
	update: async function(status, ping){
		return new Promise(async (resolve, reject) => {

			const game = new Game(config.gameID, config.interval);
			await game.fetch();

			const newTurn = game.newTurnCheck();

			if(!status && !newTurn) return reject('Нет новостей');

			if((!newTurn && this.lastPing !== undefined && this.lastPing + config.intervalPing * 3600000 >= game.updatedAt) || !ping){
				ping = false;
			}

			const users = game.getUsers();
			if(!users) return reject('Ошибка парсинга!');

			const { description, pingList } = this.generateUsers(users, ping);

			const data = this.generateEmbed(game, description);

			if(ping && pingList){
				this.lastPing = game.updatedAt;
			}

			resolve({

				/**
				 * Эмбед для отправки
				 * @type {{embeds: MessageEmbed[]}}
				 */
				data: data,

				/**
				 * Список пингов юзеров
				 * @type {string}
				 */
				pingList: pingList

			});

		});
	},

	/**
	 * Формирует список юзеров
	 * @param {string[]} users Массив HTML блоков игроков
	 * @param {boolean} ping Необходимость в пинге
	 * @return {Object}
	 */
	generateUsers: function(users, ping){
		let description = '';
		let primaryPingList = '';
		let secondPingList = '';
		let pingList = '';

		description = '';

		for(const userHTML of users){
			const user = new UserDiplomacy(userHTML);

			description += '\n';
			description += user.status + ' ';
			description += '`' + String(user.supply).padStart(2);
			description += '|' + String(user.units).padStart(2) + '` ';
			description += user.flag;
			description += ' `' + user.tag + '` ';
			description += user.toString();

			if(user.primaryPing) primaryPingList += user;
			if(user.secondPing) secondPingList += user;
		}

		if(ping){
			if(secondPingList) pingList = secondPingList;
			if(primaryPingList) pingList = primaryPingList;
		}

		return {

			/**
			 * Список юзеров
			 * @type {string}
			 */
			description: description,

			/**
			 * Список пингов юзеров
			 * @type {string}
			 */
			pingList: pingList

		}
	},

	/**
	 * Генерирует эмбед для отправки
	 * @param {Game} game
	 * @param {string} description Список юзеров
	 * @return {{embeds: MessageEmbed[]}}
	 */
	generateEmbed: function(game, description){

		let embed = new Discord.MessageEmbed();

		embed.setTimestamp();

		embed.setAuthor({
			name: 'www.vdiplomacy.com',
			url: 'https://www.vdiplomacy.com/board.php?gameID=' + game.id
		});

		embed.setDescription('Конец хода <t:' + game.getDeadline() + ':R>\n ' + description);

		embed.setFooter({
			text: game.getSeason() + ', ' + game.getYear() + ', ' + game.getPhase()
		});

		embed.setImage(game.getImage());

		if(game.newTurnCheck()){
			embed.setTitle('Новый ход!');
		}

		return { embeds: [embed] };

	}

};
