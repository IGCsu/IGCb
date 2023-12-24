import BaseCommand from '../../BaseClasses/BaseCommand.js';
import LangSingle from '../../BaseClasses/LangSingle.js';

import about from './about.json';
import { StarboardController } from '../../libs/Controller/StarboardController';
import { System } from '../../libs/System/System';

export class Starboard extends BaseCommand
{
	protected starboardController: StarboardController;

	public constructor (path: string)
	{
		super(path);

		this.category = 'Развлечения';
		this.name = 'starboard';
		this.title = this.description = new LangSingle(about.title);

		this.starboardController = System.get(StarboardController);

		// @ts-ignore @FIXME: Жалко конечно, что конструктор возвращает Promise
		return new Promise(async resolve => {
			await this.starboardController.init();

			resolve(this);
		});
	}
}
