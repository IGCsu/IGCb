import flags from './gameData/flags.json';
import phases from './gameData/phases.json';
import players from './gameData/players.json';
import seasons from './gameData/seasons.json';
import statuses from './gameData/statuses.json';
import time from './gameData/time.json';
import { Timestamp } from './DiplomacyGame';
import { Snowflake } from 'discord-api-types/v6';
import { EmojiIdentifierResolvable } from 'discord.js';

/** Ключ данных */
export type GameDataKey = string;

export interface GameDataMap {
	[key: GameDataKey]: string | number;
}

export class DiplomacyDataConvert {

	protected static readonly flags: GameDataMap = flags;
	protected static readonly phases: GameDataMap = phases;
	protected static readonly players: GameDataMap = players;
	protected static readonly seasons: GameDataMap = seasons;
	protected static readonly statuses: GameDataMap = statuses;
	protected static readonly time: GameDataMap = time;

	public static convertFlag (key: GameDataKey): EmojiIdentifierResolvable {
		return String(this.flags[key]);
	}

	public static convertPhase (key: GameDataKey): string {
		return String(this.phases[key]);
	}

	public static convertPlayer (key: GameDataKey): Snowflake {
		return String(this.players[key]);
	}

	public static convertSeason (key: GameDataKey): string {
		return String(this.seasons[key]);
	}

	public static convertStatus (key: GameDataKey): EmojiIdentifierResolvable {
		return String(this.statuses[key]);
	}

	public static convertTime (key: GameDataKey): Timestamp {
		return Number(this.time[key]);
	}
}
