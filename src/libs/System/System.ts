import { ObjectLiteral } from 'typeorm/common/ObjectLiteral';

/**
 * Несложный DI контейнер, собственного производства.
 * Этот класс может фигурировать только в конструкторах.
 */
export class System
{
	protected static instanceMap = new Map();

	public static get<I extends ObjectLiteral> (c: new (...args: any) => I): I
	{
		let instance: I | undefined = this.instanceMap.get(c);

		if (instance !== undefined) {
			return instance;
		}

		instance = new c();

		this.instanceMap.set(c, instance);

		return instance;
	}
}