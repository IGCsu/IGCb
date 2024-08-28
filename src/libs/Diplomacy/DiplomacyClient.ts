import fetch from 'node-fetch';
import { GameID, GameTurn } from './DiplomacyGame';
import { DiplomacyUpdateError } from './Error/DiplomacyUpdateError';

/** Сырой HTML */
export type HTML = string;

export class DiplomacyClient {

	public static readonly HOST = 'www.vdiplomacy.com';

	protected static readonly host = 'https://www.vdiplomacy.com/';
	protected static readonly boardEndpoint = 'board.php?gameID=';
	protected static readonly mapEndpoint = 'map.php?gameID=';

	public static async fetchBoard (id: GameID): Promise<HTML> {
		try {
			const response = await fetch(this.getBoardUrl(id));

			return await response.text();
		} catch (e) {
			if (e instanceof Error) {
				throw new DiplomacyUpdateError(e.message);
			}
			throw e;
		}
	}

	public static getBoardUrl (id: GameID): string {
		return this.host + this.boardEndpoint + id;
	}

	public static getMapUrl (id: GameID, turn: GameTurn): string {
		return this.host + this.mapEndpoint + id + '&turn=' + turn + '&mapType=large';
	}

}
