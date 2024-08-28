import { DiplomacyGame } from './DiplomacyGame';
import { DB } from '../DB';
import { DiplomacyStat } from './DiplomacyStat';
import { Snowflake } from 'discord-api-types/v6';

export const enum DiplomacyUserWaitStatusEnum {
	PRIMARY = 0,
	SECOND = 1,
}

export interface DiplomacyStatUsers {
	[key: Snowflake]: DiplomacyUserWaitStatusEnum;
}

/**
 * Статистика времени хода игроков.
 *
 * Сохраняем временные метки состояния игроков.
 * Каждое обновление мы смотрим:
 *   если состояние и ход не поменялись - просто актуализируем время
 *   если состояние или ход поменялись - создаём новую строку
 *
 * Путём недолгого думания и нехитрых вычислений можем высчитывать,
 * сколько времени прошло между сменами состояний и на основании этого строим статистику.
 */
export class DiplomacyStatService {

	public static async updateGame (game: DiplomacyGame) {
		const repository = DB.getRepository(DiplomacyStat);
		const statUsers = this.generateDiplomacyStatUsers(game);

		let lastStat = await repository.findOne({
			where: {
				turn: game.getTurn()
			},
			order: {
				id: 'desc'
			}
		});

		// Если обновился ход - сохраним пустую временную метку начала хода.
		if (lastStat === null || lastStat.turn !== game.getTurn()) {
			const newTurn = new DiplomacyStat();

			newTurn.users = DiplomacyStat.NEW_TURN_USERS_STATE;
			newTurn.turn = game.getTurn();
			newTurn.updatedAt = game.getUpdateAt();

			await repository.save(newTurn);
		}

		if (
			lastStat === null
			|| lastStat.users !== statUsers
			|| lastStat.turn !== game.getTurn()
		) {
			// состояние или ход поменялись - создаём новую сущность
			lastStat = new DiplomacyStat();
			lastStat.users = statUsers;
			lastStat.turn = game.getTurn();
		}

		lastStat.updatedAt = game.getUpdateAt();

		await repository.save(lastStat);
	}

	// TODO: Надо реализовать, пока только сохраняем и копим статистику
	// public static async getUsersStat () {}

	protected static generateDiplomacyStatUsers (game: DiplomacyGame): string {
		let usersStat: DiplomacyStatUsers = {};

		for (const user of game.getUsers()) {
			if (user.needSecondPing()) {
				usersStat[user.getId()] = DiplomacyUserWaitStatusEnum.SECOND;
			}
			if (user.needPrimaryPing()) {
				usersStat[user.getId()] = DiplomacyUserWaitStatusEnum.PRIMARY;
			}
		}

		return JSON.stringify(usersStat);
	}

}
