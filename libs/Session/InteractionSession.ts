import { Session } from './Session';
import { Logger } from '../Logger';
import { CommandInteraction } from 'discord.js';
import { Lang } from '../Lang';

export class InteractionSession extends Session {

	public readonly int: CommandInteraction;

	public constructor (int: CommandInteraction, logger: Logger, lang: Lang) {
		super(logger, lang);

		this.int = int;
	}

	public static init (int: CommandInteraction, logger: Logger) {
		return new this(int, logger, Lang.get(int.locale));
	}

}