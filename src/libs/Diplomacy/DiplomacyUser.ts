import { Snowflake } from 'discord-api-types/v6';
import { HTML } from './DiplomacyClient';
import { regexps } from './gameData/regexps';
import { DiplomacyUpdateError } from './Error/DiplomacyUpdateError';
import { DiplomacyDataConvert } from './DiplomacyDataConvert';
import { EmojiIdentifierResolvable } from 'discord.js';

export class DiplomacyUser {

	static readonly STATUS_SKIP = 'Skip';
	static readonly STATUS_COMPLETED = 'Completed';
	static readonly STATUS_NOT_RECEIVED = 'Not received';

	protected id: Snowflake;

	/** Необходимость пингануть юзера по причине отсутствия действий */
	protected primaryPing!: boolean;

	/** Необходимость пингануть юзера по причине не готовности */
	protected secondPing!: boolean;

	protected status: EmojiIdentifierResolvable;

	protected countryFlag: EmojiIdentifierResolvable;
	protected countryTag: string;

	protected countSupply: string;
	protected countUnits: string;

	constructor (raw: HTML) {
		const data = this.matchUser(raw);
		const status = this.matchStatus(data[1]);
		const country = data[2];

		this.primaryPing = status === DiplomacyUser.STATUS_NOT_RECEIVED;
		this.secondPing = status === DiplomacyUser.STATUS_COMPLETED;
		this.id = DiplomacyDataConvert.convertPlayer(data[3]);
		if (!this.id) {
			throw new DiplomacyUpdateError('User discord not found');
		}

		this.status = DiplomacyDataConvert.convertStatus(status);
		this.countryFlag = DiplomacyDataConvert.convertFlag(country);
		this.countryTag = country.slice(0, 3).toUpperCase();
		this.countSupply = data[7].padStart(2);
		this.countUnits = data[8].padStart(2);
	}

	protected matchUser (raw: HTML): string[] {
		const data = raw.match(regexps.user);
		if (!data || !data[8]) {
			throw new DiplomacyUpdateError('User is invalid');
		}
		return data;
	}

	protected matchStatus (raw: string): string {
		const status = raw.match(regexps.status);
		return status ? status[1] : DiplomacyUser.STATUS_SKIP;
	}

	public needPrimaryPing (): boolean {
		return this.primaryPing;
	}

	public needSecondPing (): boolean {
		return this.secondPing;
	}

	public getId (): Snowflake {
		return this.id;
	}

	/** Возвращает конструкцию упоминания пользователя */
	public toString (): string {
		return '<@' + this.id + '>';
	}

	public toDesc (): string {
		let desc = '\n';

		desc += this.status + ' ';
		desc += '`' + this.countSupply;
		desc += '|' + this.countUnits + '` ';
		desc += this.countryFlag;
		desc += ' `' + this.countryTag + '` ';
		desc += this.toString();

		return desc;
	}
}
