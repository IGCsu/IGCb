import BaseCommand from '../../BaseClasses/BaseCommand.js';
import LangSingle from '../../BaseClasses/LangSingle.js';
import { DiplomacyGame, GameID, RequestInterval, Timestamp } from '../../libs/Diplomacy/DiplomacyGame';
import { DiplomacyClient } from '../../libs/Diplomacy/DiplomacyClient';
import { Response } from '../../libs/Error/Response';
import { CommandInteraction, MessageEmbed, TextBasedChannel } from 'discord.js';
import about from './about.json';
import { slashOptions } from './slashOptions';
import { Snowflake } from 'discord-api-types/v6';
import { DiplomacyResponse } from '../../libs/Diplomacy/DiplomacyResponse';

/**
 * @TODO: need refactor
 */
export class Diplomacy extends BaseCommand {

	public static readonly GAME_ID: GameID = 56981;
	public static readonly INTERVAL_PING = 2 * 3600;
	public static readonly INTERVAL_FETCH: RequestInterval = 600;
	public static readonly CHANNEL: Snowflake = '610371610620198922';

	public static readonly FLAG_PING = 'ping';
	public static readonly FLAG_PUBLIC = 'public';

	protected channel!: TextBasedChannel;
	protected lastPing!: Timestamp;
	protected game: DiplomacyGame;

	// @TODO: И какий дебил придумал делать в конструкторе все?
	public constructor (path: string) {
		super(path);

		this.category = 'Развлечения';
		this.name = 'diplomacy';
		this.title = new LangSingle(about.title);
		this.description = new LangSingle(about.title);
		this.slashOptions = slashOptions;

		this.game = new DiplomacyGame(
			Diplomacy.GAME_ID,
			Diplomacy.INTERVAL_FETCH
		);

		// @ts-ignore @TODO: Надо бы уже избавиться от Promise в constructor
		return new Promise(async resolve => {
			try {
				// @ts-ignore @TODO: Надо бы уже избавиться от глобальных переменных
				this.channel = guild.channels.cache.get(Diplomacy.CHANNEL);

				await this.ping();

				setInterval(
					async () => this.ping(),
					Diplomacy.INTERVAL_FETCH * 1000
				);
			} catch (e) {
				// @ts-ignore
				log.initText += log.error(path + ': ' + e);
				this.active = false;
			}

			resolve(this);
		});
	}

	public async ping (): Promise<void> {
		const res = await this.update(true);
		if (this.game.isNewTurn()) {
			this.channel.send({
				content: res.pingList,
				embeds: res.embeds
			});
		}
	}

	public async slash (int: CommandInteraction) {
		const flag = int.options.getString('flag');
		let ephemeral = flag !== Diplomacy.FLAG_PING && flag !== Diplomacy.FLAG_PUBLIC;

		await int.deferReply({
			ephemeral: ephemeral
		});

		try {
			const res = await this.update(flag === Diplomacy.FLAG_PING);

			/**
			 * Если выясняем, что наступил новый ход - убираем ответ клиенту.
			 * Просто отправляем сообщение о новом ходе.
			 */
			if (this.game.isNewTurn()) {
				await int.deleteReply();
				await this.channel.send({
					content: res.pingList,
					embeds: res.embeds
				});
				return;
			}

			await int.editReply({
				embeds: res.embeds
			});

			if (res.pingList) {
				await int.followUp({
					content: res.pingList
				});
			} else if (flag === Diplomacy.FLAG_PING) {
				await int.followUp({
					// @ts-ignore
					content: int.str('PING_TIMEOUT')
						+ '(<t:' + (this.lastPing + Diplomacy.FLAG_PING) + ':R>)',
					ephemeral: true
				});
			}
		} catch (e) {
			if (e instanceof Response) {
				return await e.sendErrorMessage(int);
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
	public async update (ping: boolean = false): Promise<DiplomacyResponse> {
		const game = await this.game.fetch();
		const newTurn = game.isNewTurn();

		let pingList = '';

		if (
			ping
			&& this.lastPing !== undefined
			&& this.lastPing + Diplomacy.INTERVAL_PING >= game.getUpdateAt()
		) {
			ping = false;
		}

		if (ping || newTurn) {
			pingList = this.generatePingList(game);
			if (pingList) {
				this.lastPing = game.getUpdateAt();
			}
		}

		return new DiplomacyResponse(
			[this.generateEmbed(game)],
			pingList
		);
	}

	public generatePingList (game: DiplomacyGame): string {
		let primaryPingList = '';
		let secondPingList = '';

		for (const user of game.getUsers()) {
			if (user.getPrimaryPing()) primaryPingList += user;
			if (user.getSecondPing()) secondPingList += user;
		}

		primaryPingList = 'бла-бла пинги';

		return primaryPingList ?? secondPingList;
	}

	public generateEmbed (game: DiplomacyGame): MessageEmbed {
		let embed = new MessageEmbed();

		let desc = 'Конец хода <t:' + game.getDeadline() + ':R>\n ';
		for (const user of game.getUsers()) {
			desc += user.toDesc();
		}

		embed.setTimestamp();

		embed.setAuthor({
			name: DiplomacyClient.HOST,
			url: DiplomacyClient.getBoardUrl(game.getId())
		});

		embed.setDescription(desc);

		embed.setFooter({
			text: game.getTurn() + ' ход • ' + game.getSeason() + ', ' +
				game.getYear() + ' • ' + game.getPhase()
		});

		embed.setImage(DiplomacyClient.getMapUrl(game.getId(), game.getTurn()));

		if (game.isNewTurn()) {
			embed.setTitle('Новый ход!');
		}

		return embed;

	}

}
