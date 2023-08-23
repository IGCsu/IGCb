import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { SelectQueryBuilder } from 'typeorm/query-builder/SelectQueryBuilder';
import { QueryRunner } from 'typeorm/query-runner/QueryRunner';
import { EntityTarget } from 'typeorm/common/EntityTarget';
import { ObjectLiteral } from 'typeorm/common/ObjectLiteral';
import { DiplomacyStat } from './Diplomacy/DiplomacyStat';
import { Repository } from 'typeorm/repository/Repository';

export class DB {

	public static readonly TYPE = 'mysql';

	public static readonly entities = [
		DiplomacyStat
	];

	/** Коннект к БД */
	protected static source: DataSource;

	/**
	 * Инициализирует подключение к БД
	 */
	public static async init () {
		this.source = new DataSource({
			type: this.TYPE,
			host: process.env.DB_HOST,
			username: process.env.DB_USER,
			password: process.env.DB_PASSWORD,
			database: process.env.DB_DATABASE,
			synchronize: true,
			logging: false,
			entities: this.entities
		});

		await this.source.initialize();
	}

	/** Возвращает билдер запросов */
	public static query<Entity extends ObjectLiteral> (
		target: EntityTarget<Entity>,
		alias?: string,
		queryRunner?: QueryRunner
	): SelectQueryBuilder<Entity> {
		return this.getRepository(target)
			.createQueryBuilder(alias, queryRunner);
	}

	public static getRepository<Entity extends ObjectLiteral> (
		target: EntityTarget<Entity>
	): Repository<Entity> {
		return this.source.getRepository(target);
	}

}