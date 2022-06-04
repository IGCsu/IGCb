const fetch = require('node-fetch');

const slashOptions = require('./slashOptions.json');
const { title, description } = require('./about.json');
const noXPChannels = require('./noXPChannels.json');
const UserLevels = require('./UserLevels');

const { command } = require('../help');

module.exports = {

	active : true,
	category : 'Уровни активности',

	name : 'levels',
	title : title,
	description : description,
	slashOptions : slashOptions,

	noXPChannels : noXPChannels,

	/**
	* Массив уровней
	* @type {Array}
	*/
	roles : [],

	/**
	* Массив ID ролей уровней. Используется для поиска.
	* @type {Array}
	*/
	rolesIDs : [],

	init : async function(path){

		this.roles = DB.query('SELECT * FROM levels_roles');
		this.roles.sort((a, b) => b.value - a.value);
		this.rolesIDs = [];

		for(let r = 0; r < this.roles.length; r++){
			this.roles[r].pos = r;
			this.roles[r].cache = guild.roles.cache.get(this.roles[r].id);
			if(this.roles[r].id == '648762974277992448') continue;
			this.rolesIDs.push(this.roles[r].id);
		}

		return this;

	},


	/**
	 * Обработка команды
	 * Выдаёт статистику по пользовтаелю и ссылку на страницу
	 * @param  {CommandInteraction|UserContextMenuInteraction} int    Команда пользователя
	 * @param  {GuildMember}                                   member Объект пользователя
	 * @return {InteractionReplyOptions}
	 */
	call : async function(int, member){

		const name = member2name(member, true);
		const user = new UserLevels(member, this.roles, this.rolesIDs);

		if(!user.finded) return { error: 'Unknown User' };

		const embed = user.getEmbed();

		const status = !commands.handler && !commands.handler.siteStatus;

		return {
			embeds : [embed],
			components: [{type:1, components: [
				{ type: 2, style: 5, url: 'https://igc.su/levels', label: 'Таблица' , disabled: status},
				{ type: 2, style: 5, url: 'https://igc.su/levels?id=' + user.id, label: 'Статистика пользователя' , disabled: status}
			]}],
		};

	},


	/**
	 * Обработка слеш-команды
	 * @param {CommandInteraction} int Команда пользователя
	 */
	slash : async function(int){
		const content = await this.call(int, int.options.getMember('user') ?? int.member);

		if(content.error)
			return await int.reply({ content: reaction.emoji.error + ' ' + localize(int.locale, content.error), ephemeral: true });

		await int.reply(content);
	},

	/**
	 * Обработка контекстной команды
	 * @param {UserContextMenuInteraction} int
	 */
	contextUser : async function(int){
		const content = await this.call(int, int.targetMember);

		if(content.error)
			return await int.reply({ content: reaction.emoji.error + ' ' + localize(int.locale, content.error), ephemeral: true });

		content.ephemeral = true;
		await int.reply(content);
	},



	/**
	 * Обработчик сообщений пользователя
	 * Мониторинг всех сообщений для начисления опыта пользователям. Игнорируются сообщения бота и в некоторых каналах.
	 * @param {Message} msg Сообщение пользователя
	 */
	message : async function(msg){
		if(msg.author.bot) return;
		const channel = msg.channel.isThread() ? msg.channel.parent : msg.channel;
		if(this.noXPChannels.includes(channel.parentId)) return;
		if(this.noXPChannels.includes(channel.id)) return;

		let user = new UserLevels(msg.member, this.roles, this.rolesIDs, true);

		user.userMessageСounting(msg)
			.update()
			.updateRole();

	},

};
