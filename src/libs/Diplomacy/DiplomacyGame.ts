import { DiplomacyClient, HTML } from './DiplomacyClient';
import { regexps } from './gameData/regexps';
import { DiplomacyUpdateError } from './Error/DiplomacyUpdateError';
import { DiplomacyDataConvert } from './DiplomacyDataConvert';
import { DiplomacyUser } from './DiplomacyUser';

/** ID игры на сайте */
export type GameID = number;

/** Интервал в секундах между запросами */
export type RequestInterval = number;

export type Timestamp = number;

export class DiplomacyGame {

	protected deadline!: Timestamp;
	protected phaseLength!: Timestamp;
	protected turn!: number;
	protected season!: string;
	protected phase!: string;
	protected year!: number;
	protected users: DiplomacyUser[] = [];

	protected body!: HTML;

	protected updatedAt!: Timestamp;

	public constructor (
		protected id: GameID,
		protected interval: RequestInterval
	) {
		this.id = id;
		this.interval = interval;
	}

	public async fetch (): Promise<DiplomacyGame> {
		this.body = await DiplomacyClient.fetchBoard(this.id);

		this.deadline = Number(this.get('deadline'));
		this.phaseLength = DiplomacyDataConvert.convertTime(String(this.get('phaseLength')));
		this.turn = Number(this.get('turn'));

		const meta = this.get('meta', true);
		if (!meta[3]) {
			throw new DiplomacyUpdateError('Meta is invalid');
		}

		this.season = DiplomacyDataConvert.convertSeason(meta[1]);
		this.year = Number(meta[2]);
		this.phase = DiplomacyDataConvert.convertPhase(meta[3]);

		this.users = [];
		const users = this.get('users', true);
		for (const user of users) {
			this.users.push(new DiplomacyUser(user));
		}

		this.updatedAt = Math.floor(Date.now() / 1000);

		return this;
	}

	/**
	 * Проверяет, случился ли ход с последнего обновления
	 * true - ход случился, false - новый ход не случился
	 */
	public isNewTurn (): boolean {
		return this.updatedAt + this.phaseLength - this.interval < this.deadline
			&& this.interval < this.phaseLength;
	}

	public getDeadline (): Timestamp {
		return this.deadline;
	}

	public getPhaseLength (): number {
		return this.phaseLength;
	}

	public getTurn (): number {
		return this.turn;
	}

	public getSeason (): string {
		return this.season;
	}

	public getPhase (): string {
		return this.phase;
	}

	public getYear (): number {
		return this.year;
	}

	public getUsers (): DiplomacyUser[] {
		return this.users;
	}

	public getUpdateAt (): Timestamp {
		return this.updatedAt;
	}

	public getId (): GameID {
		return this.id;
	}

	protected get (
		key: string,
		needArray: boolean = false
	): string | string[] {
		const value = this.body.match(regexps[key]);
		if (value === null) {
			throw new DiplomacyUpdateError('Not match ' + key);
		}
		return needArray ? value : value[1];
	}

}
