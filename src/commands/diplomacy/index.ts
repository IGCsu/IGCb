import BaseCommand from '../../BaseClasses/BaseCommand.js';
import LangSingle from '../../BaseClasses/LangSingle.js';
import { Game, Timestamp } from './Game';
import config from './gameData/config.json';
import { GameClient } from './GameClient';
import { Response } from '../../Error/Response';
import {
	CommandInteraction,
	InteractionEditReplyOptions,
	MessageEmbed,
	TextBasedChannel
} from 'discord.js';
import about from './about.json';
import { slashOptions } from './slashOptions';

/**
 * @TODO: need refactor
 */
export class Diplomacy extends BaseCommand {

	public static readonly FLAG_PING = 'ping';
	public static readonly FLAG_PUBLIC = 'public';

	protected lastPing!: Timestamp;
	protected channel!: TextBasedChannel;

	public constructor (path: string) {
		super(path);

		this.category = 'Развлечения';
		this.name = 'diplomacy';
		this.title = new LangSingle(about.title);
		this.description = new LangSingle(about.title);
		this.slashOptions = slashOptions;

		// @ts-ignore @TODO: Надо бы уже избавиться от Promise в constructor
		return new Promise(async resolve => {
			resolve(this);
		});
	}

	public async init (path: string) {
		try {
			await GameClient.fetchBoard(config.gameID);
		} catch (e) {
			// @ts-ignore
			log.initText += log.error(path + ': ' + e);
			this.active = false;
			return this;
		}

		// @ts-ignore @TODO: Надо бы уже избавиться от глобальных переменных
		this.channel = guild.channels.cache.get(config.channel);

		setInterval(async () => {
			try {
				const res = await this.update(true, true);
				this.channel.send(res);
			} catch (e) {
				if (e ! instanceof Response) {
					throw e;
				}
			}
		}, config.interval * 1000);

		return this;
	}

	public async slash (int: CommandInteraction) {
		const flag = int.options.getString('flag');
		const ephemeral = flag !== Diplomacy.FLAG_PING && flag !== Diplomacy.FLAG_PUBLIC;

		await int.deferReply({
			ephemeral: ephemeral
		});

		try {
			const res = await this.update(true, flag === Diplomacy.FLAG_PING);
			const pingList = res.content;

			delete res.content; // Пинги все равно не сработают
			await int.editReply(res);

			if (pingList) {
				await int.followUp({ content: pingList });
			}
		} catch (e) {
			if (e instanceof Response) {
				await int.editReply({
					content: String(e)
				});
			}
			throw e;
		}
	}


	/**
	 * Запрос к сайту.
	 * Определяет, не случилось ли обновление хода в интервал между проверками
	 * Перебирает список игроков для выяснения их статуса. Пингует только тех, у кого ходов не сделано вообще и только
	 * в том случае, если в течении шести часов он не пинговал до этого
	 */
	public async update (status: boolean, ping: boolean = false): Promise<InteractionEditReplyOptions> {
		const game = await Game.init(config.gameID, config.interval);
		const newTurn = game.newTurnCheck();

		let pingList = '';

		if (!status && !newTurn) {
			throw new Response('Нет новостей');
		}

		if (
			ping
			&& !newTurn && this.lastPing !== undefined
			&& this.lastPing + config.intervalPing * 3600 >= game.getUpdateAt()
		) {
			ping = false;
		}

		if (ping) {
			pingList = this.generatePingList(game);
			if (pingList) {
				this.lastPing = game.getUpdateAt();
			}
		}

		return {
			embeds: [this.generateEmbed(game)],
			content: pingList
		};
	}

	public generatePingList (game: Game): string {
		let primaryPingList = '';
		let secondPingList = '';

		for (const user of game.getUsers()) {
			if (user.getPrimaryPing()) primaryPingList += user;
			if (user.getSecondPing()) secondPingList += user;
		}

		return primaryPingList ?? secondPingList;
	}

	public generateEmbed (game: Game): MessageEmbed {
		let embed = new MessageEmbed();

		let desc = 'Конец хода <t:' + game.getDeadline() + ':R>\n ';
		for (const user of game.getUsers()) {
			desc += user.toDesc();
		}

		embed.setTimestamp();

		embed.setAuthor({
			name: GameClient.HOST,
			url: GameClient.getBoardUrl(game.getId())
		});

		embed.setDescription(desc);

		embed.setFooter({
			text: game.getTurn() + ' ход • ' + game.getSeason() + ', ' +
				game.getYear() + ' • ' + game.getPhase()
		});

		embed.setImage(GameClient.getMapUrl(game.getId(), game.getTurn()));

		if (game.newTurnCheck()) {
			embed.setTitle('Новый ход!');
		}

		return embed;

	}

}
