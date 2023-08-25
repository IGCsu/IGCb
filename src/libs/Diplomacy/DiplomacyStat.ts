import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { GameTurn, Timestamp } from './DiplomacyGame';
import { Snowflake } from 'discord-api-types/v6';

@Entity()
export class DiplomacyStat {

	public static readonly NEW_TURN_USERS_STATE = 'turn';

	@PrimaryGeneratedColumn()
	public id!: Snowflake;

	@Column('int')
	public turn!: GameTurn;

	@Column('bigint')
	public updatedAt!: Timestamp;

	@Column('longtext')
	public users!: string;

}
