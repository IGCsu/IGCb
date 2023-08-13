import fetch from 'node-fetch';
import { GameID } from './Game';

/** Сырой HTML */
export type HTML = string;

export class GameClient {

	public static readonly HOST = 'www.vdiplomacy.com';

	protected static readonly host = 'https://www.vdiplomacy.com/';
	protected static readonly boardEndpoint = 'board.php?gameID=';
	protected static readonly mapEndpoint = 'map.php?gameID=';

	public static async fetchBoard (id: GameID): Promise<HTML> {
		const response = await fetch(this.getBoardUrl(id));

		return await response.text();
	}

	public static getBoardUrl (id: GameID): string {
		return this.host + this.boardEndpoint + id;
	}

	public static getMapUrl (id: GameID, turn: number): string {
		return this.host + this.mapEndpoint + id + '&turn=' + turn + '&mapType=large';
	}

}
