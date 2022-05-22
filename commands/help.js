const localize = require("../functions/localize");

module.exports = {

	active : true,
	category : 'Утилиты',

	name : 'help',
	title : 'Помощь по командам',
	description : 'Показывает список доступных команд или описание указанной команды',
	descriptionShort : 'Shows a list of available commands or a description of the specified command',
	description_localizations : {'ru': 'Показывает список доступных команд или описание указанной команды', 'uk': 'Показувати список доступних команд або опис зазначеної команди'},


	init : function(){ return this; },

	slashOptions: [
		{
			type: 3,
			required: false,
			name: 'category',
			name_localization: {ru: 'категория', uk: 'категорія'},
			description: 'Additional information',
			description_localization: {ru: 'Дополнительная информация', uk: 'Додаткова інформація'},
			choices: [
				{ name: 'About Activities', value: 'activities', name_localization: {ru: 'О Activities', uk: 'Про Activities'} },
				{ name: 'About Game roles', value: 'roles', name_localization: {ru: 'О Игровых ролях', uk: 'Про Ігрових ролях'} },
				{ name: 'About Polls', value: 'polls', name_localization: {ru: 'Об Опросах', uk: 'Про Опитування'} },
				{ name: 'About Voice channels', value: 'voices', name_localization: {ru: 'О Голосовых каналах', uk: 'Про Голосових каналах'} },
			]
		}
	],

	/**
	 * Обработка команды
	 * В зависимости от указанных параметров, отправляет либо описание указанной команды, либо список команд
	 *
	 * @param {Message|CommandInteraction} msg
	 * @param {String}                     command Команда
	 */
	call : async function(msg, command){
		return command ? this.command(command) : this.cache;
	},

	/**
	 * Обработка слеш-команды
	 * @param {CommandInteraction} int Команда пользователя
	 */
	slash : async function(int){
		let embed
		const category = int.options.getString('category');
		if(!category){
			embed = await this.call(int);
		} else {
			embed = this.notes[category];
		}
		embed.setColor('BLURPLE');
		return await int.reply({ embeds : [embed], fetchReply: true });
	},

	/**
	 * Обработка традиционной команды
	 * @param {Message} msg Сообщение пользователя
	 */
	message : async function(msg, params){
		const embed = await this.call(msg, params[0]);
		await msg.channel.send({ embeds : [embed] });
	},


	/**
	 * Генерирование и кэширование списка команд
	 *
	 * @param  {Object} list Список команд
	 * @return {Embed}
	 */
	generate : function(list){
		let help = {};

		for(let c in list){
			if(typeof list[c] === 'string') continue;

			const category = list[c].category ? list[c].category : 'Остальные'

			if(!help.hasOwnProperty(category)) help[category] = [];
			help[category].push( this.getCommand(list[c]) );
		}

		this.cache = new Discord.MessageEmbed()
			.setTitle('Модули бота')
			.setColor('BLURPLE');

		for(let c in help){
			const command = help[c];
			this.cache.addField(c, help[c].sort().join('\n'));
		}

	},


	getCommand : c => {
		return '`' + c.name + '` - ' + c.title + (c.description_localization?.ru ? (', *' + c.description_localization?.ru + '*') : '');
	},

	notes: {
		activities: new Discord.MessageEmbed({title: 'DISCORD ACTIVITIES', description:
		`   Это эксперементальная функция ПК версии дискорд. Вы можете запускать отдельные приложения внутри Дискорда.
		Для этого вам сначала нужно зайти в голосовой канал. Далее введите \`/activities\`

		\`канал:\` - как значение укажите ваш текущий голосовой канал.
		\`activity:\` - выберете активность которая вам приглянулась. Не стесняйтесь протестировать их все.`}),

		roles: new Discord.MessageEmbed({title: 'ИГРОВЫЕ РОЛИ', description:
		`   Для взаимодействия с игровыми ролями используется команда \`/role\`
		\`role:\` - начните вводить название роли. Во всплывающем окне выберите нужную. Бот переключет её вам. То есть выдаст её вам если у вас её не было. Если же у вас была эта роль то наоборот заберёт.
		Если хотите увидеть список всех ролей, то оставьте аргумент \`role\` пустым и выберете первую опцию во всплывающем меню.

		   Так же существует два необязательных аргумента
		\`members:\` укажите упоминания или ID пользователей которым вы хотите переключить роль. *Требуются доп. права.*
		\`create:\` создать ли команду если имя в аргументе \`role:\` не было найдено. Требуются доп. права.`}),

		polls: new Discord.MessageEmbed({title: 'ОПРОСЫ', description:
		`   Для опросов используется команда \`/poll\`.
		Существует 3 подкомманды:
		\`/poll common\` - создаёт опрос среди всех. То есть отвечать на него и получать результаты о нём могут все.
		\`/poll senate\` - создаёт модераторский опрос. Отвечать и просматривать результаты могут только модераторы с Легион и выше.
		Эти две команды имеют одинаковые аргументы:
		\`вопрос:\` - ваш вопрос. На него будут отвечать опрошенные.
		\`min:\` - минимальное количество символов в ответе. 0 - ответ не обязателен. По умолчанию 0.
		\`public:\` - публичный ли опрос. Если Ложь то каждый в результатах будет видеть общее количество голосов и свой голос. Если Истина то будут также видны ответы остальных проголосовавших.

		\`/poll show\` поиск опроса или ответа. Можно ввести любую информацию о опросе/ответе. Однако пока что поддерживаются только ID сообщений и пользователей.
		Бот предложит список из найденных объектов системы опросов.

		__**Обратите внимание**__ что из соображений пользовательского опыта в результатах не видно весь текст ответа. Чтобы посмотреть весь ответ воспользуйтесь \`/poll show\`

		> **ОТВЕТЫ НА ОПРОСЫ**
		   Чтобы ответить на опрос достойно нажать на кнопку ЗА или ПРОТИВ под сообщением бота. После этого откроется всплывающее окно в котором вам будет предложено ввести ответ. Чтобы подтвердить голос вам нужно нажать *Отправить*.`}),

		voices: new Discord.MessageEmbed({title: 'ВОЙСЫ', description:
		`   В Сообществе реализована система приватных голосовых каналов. Это означает что статических голосовых каналов нет. Чтобы создать канал вам нужно зайти в Создать канал. Бот создаст канал и сразу же перекинет вас в него. Вы сможете полностью настроить канал под себя т.к. имеете полные права к своему каналу.
		Кроме того бот умеет сохранять конфигурацию канала. Вас не придётся каждый раз настраивать канал заново.
		\`/voice upload\` - для использования команды вам нужно быть в голосовом канале. После использования все настройки канала будут записаны в базу данных.
		\`/voice sync\` - для использования команды вам нужно быть в голосовом канале. После использования все настройки канала будут изменены на настройки которые **Вы сохранили в последний раз** в базе данных.
		\`/voice auto-sync\` - команда настраивает автоматическую синхронизацию с базой данных вашего канала.
		Пока что работает 2 режима:
		\`Отключена\` - автоматическая синхронизация отключена.
		\`Частичтная\` - при создании канала бот будет использовать данные из базы данных вместо стандартных.`,}),
	}

};
