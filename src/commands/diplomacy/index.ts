import BaseCommand from '../../BaseClasses/BaseCommand.js';
import LangSingle from '../../BaseClasses/LangSingle.js';
import { DiplomacyGame, GameID, RequestInterval, Timestamp } from '../../libs/Diplomacy/DiplomacyGame';
import { DiplomacyClient } from '../../libs/Diplomacy/DiplomacyClient';
import { Response } from '../../libs/Error/Response';
import { CommandInteraction, Message, MessageEmbed, TextBasedChannel } from 'discord.js';
import about from './about.json';
import { slashOptions } from './slashOptions';
import { Snowflake } from 'discord-api-types/v10';
import { DiplomacyResponse } from '../../libs/Diplomacy/DiplomacyResponse';
import { DiplomacyUpdateError } from '../../libs/Diplomacy/Error/DiplomacyUpdateError';
import { DiplomacyStatService } from '../../libs/Diplomacy/DiplomacyStatService';

/**
 * @TODO: need refactor
 */
export class DiplomacyController extends BaseCommand {

	public static readonly GAME_ID: GameID = 56981;
	public static readonly INTERVAL_PING = 2 * 3600;
	public static readonly INTERVAL_FETCH: RequestInterval = 600;
	public static readonly CHANNEL: Snowflake = '898257036926660698';

	public static readonly FLAG_PING = 'ping';
	public static readonly FLAG_PUBLIC = 'public';

	protected channel!: TextBasedChannel;
	protected lastPing!: Timestamp;
	protected lastGameStatusMsg!: Message;
	protected game: DiplomacyGame;

	// @TODO: И какой дебил придумал делать в конструкторе все?
	public constructor (path: string) {
		super(path);

		this.category = 'Развлечения';
		this.name = 'diplomacy';
		this.title = new LangSingle(about.title);
		this.description = new LangSingle(about.title);
		this.slashOptions = slashOptions;

		this.game = new DiplomacyGame(
			DiplomacyController.GAME_ID,
			DiplomacyController.INTERVAL_FETCH
		);

		// @ts-ignore @TODO: Надо бы уже избавиться от Promise в constructor
		return new Promise(async resolve => {
			try {
				// @ts-ignore @TODO: Надо бы уже избавиться от глобальных переменных
				this.channel = guild.channels.cache.get(DiplomacyController.CHANNEL);

				await this.notifyNewTurn();

				setInterval(
					async () => this.notifyNewTurn(),
					DiplomacyController.INTERVAL_FETCH * 1000
				);
			} catch (e) {
				// @ts-ignore
				log.initText += log.error(path + ': ' + e);
				this.active = false;
			}

			resolve(this);
		});
	}

	public async notifyNewTurn (): Promise<void> {
		try {
			const res = await this.update();
			if (this.game.isNewTurn()) {
				this.lastGameStatusMsg = await this.channel.send({
					content: res.pingList,
					embeds: res.embeds
				});
			} else if (this.lastGameStatusMsg) {
				await this.lastGameStatusMsg.edit({
					content: this.lastGameStatusMsg.content === '' ? undefined : this.lastGameStatusMsg.content,
					embeds: res.embeds
				});
			}
		} catch (e) {
			if (e instanceof DiplomacyUpdateError) {
				// @ts-ignore
				return log.warn(e.message);
			}
			throw e;
		}
	}

	public async slash (int: CommandInteraction<'cached'>) {
		const flag = int.options.getString('flag');
		let ephemeral = flag !== DiplomacyController.FLAG_PING && flag !== DiplomacyController.FLAG_PUBLIC;

		await int.deferReply({
			ephemeral: ephemeral
		});

		try {
			const res = await this.update(flag === DiplomacyController.FLAG_PING);

			/**
			 * Если выясняем, что наступил новый ход - убираем ответ клиенту.
			 * Просто отправляем сообщение о новом ходе.
			 */
			if (this.game.isNewTurn()) {
				await int.deleteReply();
				this.lastGameStatusMsg = await this.channel.send({
					content: res.pingList,
					embeds: res.embeds
				});
				return;
			}

			const message = await int.editReply({
				embeds: res.embeds
			});

			if (res.pingList) {
				await int.followUp({
					content: res.pingList
				});
			} else if (flag === DiplomacyController.FLAG_PING) {
				await int.followUp({
					content:
					// @ts-ignore
						int.str(
							'Mentions were suppressed because too little time had passed since last mentions. Timeout will pass'
						)
						+ ' <t:' + (this.lastPing + DiplomacyController.INTERVAL_PING) + ':R>',
					ephemeral: true
				});
			}

			if (!ephemeral) {
				this.lastGameStatusMsg = message;
			}

		} catch (e) {
			if (e instanceof Error) {
				const response = new Response(e.message);
				return await response.sendErrorMessage(int);
			}
			throw e;
		}
	}


	/**
	 * Запрос к сайту.
	 * Определяет, не случилось ли обновление хода в интервал между проверками.
	 * Перебирает список игроков для выяснения их статуса. Пингует только тех, у кого ходов не сделано вообще и только
	 * в том случае, если в течение шести часов он не пинговал до этого
	 */
	public async update (ping: boolean = false): Promise<DiplomacyResponse> {
		const game = await this.game.fetch();

		let pingList = '';

		if (
			this.lastPing !== undefined
			&& this.lastPing + DiplomacyController.INTERVAL_PING >= game.getUpdateAt()
		) {
			ping = false;
		}

		if (ping || game.isNewTurn()) {
			pingList = this.generatePingList(game);
			if (pingList) {
				this.lastPing = game.getUpdateAt();
			}
		}

		await DiplomacyStatService.updateGame(game);

		return new DiplomacyResponse(
			[this.generateEmbed(game)],
			pingList
		);
	}

	public generatePingList (game: DiplomacyGame): string {
		let primaryPingList = '';
		let secondPingList = '';

		for (const user of game.getUsers()) {
			if (user.needPrimaryPing()) primaryPingList += user;
			if (user.needSecondPing()) secondPingList += user;
		}

		return primaryPingList ? primaryPingList : secondPingList;
	}

	public generateEmbed (game: DiplomacyGame): MessageEmbed {
		let embed = new MessageEmbed();

		let desc = 'Конец хода <t:' + game.getDeadline() + ':R>\n'
			+ 'Обновлено <t:' + game.getUpdateAt() + ':R>\n';

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
