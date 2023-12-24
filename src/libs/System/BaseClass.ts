import { Logger } from './Logger';
import { Bot } from './Bot';
import { System } from './System';

export abstract class BaseClass
{
	protected logger: Logger;
	protected bot: Bot;

	protected constructor ()
	{
		this.logger = System.get(Logger);
		this.bot = System.get(Bot);
	}
}