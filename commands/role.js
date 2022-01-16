module.exports = {

	active : true,
  
	name : 'role',
	short : 'r',
	title : 'Игровые роли',
	description : 'Используется для работы с ролями:\nНеобходимо указать название роли. Название роли может содержать только латинский символы, а так же "-" и "_". Если роль не будет найдена - она будет создана, при наличии прав.\nПосле роли можно указать пользователей, кому вы хотите переключить роль. Указывать можно вводом ID или упоминанием, разделять нужно пробелом.\nЕсли не указывать пользователей - роль будет переключена у автора команды.',
	descriptionShort : 'Управление игровыми ролями',
	category : 'Роли',


	slashOptions : [
		{
			name : 'role',
			description : 'Имя роли или её ID',
			type : 3,
			required : true,
			autocomplete: true
		},
		{
			name : 'members',
			description : 'Укажите упоминания пользователя/ей его/их ID',
			type : 3,
			required : false
		},
		{
			name : 'create',
			description : 'Создать роль если не было найдено таковой?',
			type : 5,
			required : false
		},
	],
  

	init : function(){ return this; },
  
  
	/**
	 *
	 *
	 * @param {Message} msg
	 * @param {Array}   params Параметры команды
	 */
  
	autocomplete : async function(int){
		let choices = [];

		if (!int.options.getFocused()) return;

		const role = int.options.getFocused()
		let finded = await this.has(guild.roles, role);
		let predict = finded.roles;

		predict_name = role;
		
		predict.sort(this.comporator);
		for(let i = 0; i < predict.length && i < 25; i++) choices[i] = {name : predict[i].name, value : predict[i].id};

		int.respond(choices);
	},
  
	slash : async function(int){
		const member = guild.members.cache.get(data.member.user.id);
		const permission = this.permission(member)
	
		let role = int.options.getRole('role');
		const create = int.options.getBoolean('create');
		let members = int.options.get('members');
		if(members)
			members = members.replace(/[^-_\w]/g, ' ').match(/[0-9]+/g);
		
		if(!role) {
			if (permission && create){
			role = await this.create({member: member}, data.data.options[0].value, 45)
			return int.reply({content: reaction.emoji.success + 'Роль <@&' + role.role.id + '> созданна', allowed_mentions: { "parse": [] }})
			} else {
			return int.reply(data, {content: reaction.emoji.error + ' Роль не найдена', allowed_mentions: { "parse": [] }})
			};
		};

		let action = { val : 'add', text : 'выдана' };
		if (member.roles.cache.get(role.id))
			action = { val : 'remove', text : 'убрана у' };
		let text;
		if (!(members && permission)){
			member.roles[action.val](role.id, 'По требованию ' + member2name(member, 1));
			text = reaction.emoji.success + ' Роль <@&' + role.id + '> ' + action.text + ' <@' + member.id + '>';
		} else {text = 'Запускаю выдачу ролей'};

		int.reply({content: text, allowedMentions: { "parse": [] }});
	
		if (members && permission) members.forEach(user => int.followUp({content: reaction.emoji.error + ' ' + toggleRole(role, user, member), allowedMentions: { parse: [] }}));
	},
  
	/**
	 * Отправляет help и отсортированный список доступных игровых ролей
	 *
	 * @param {Message} msg
	 */
	help : function(){
		let roles = [];
	
		guild.roles.cache.forEach(role => {
			if(role.color == 5095913 || role.color == 3447003 || role.color == 13084411) roles.push(role.name);
		});
	
		const example = !commands.list.help ? ''
			: commands.list.help.getExample(this);
	
		const embed = new Discord.MessageEmbed()
			.setTitle('Игровые роли')
			.setDescription(example + '\n' + this.text)
			.setColor('BLURPLE')
			.addField('Список доступных ролей', roles.sort().join('\n'));
		return embed;
	},
  
  
	/**
	 * Создание роли
	 *
	 * @param {Message} msg
	 * @param {String}  name Название роли
	 * @param {Number}  pos  Позиция роли
	 */
	create : async function(msg, name, pos){
		name = name[0].toUpperCase() + name.slice(1);

		const role = await guild.roles.create({
			data : {
			name : name,
			mentionable : true,
			color : 5095913,
			position : pos
			},
			reason : 'По требованию ' + member2name(msg.member, 1)
		});
		return { role : role , chk: true};
	},
  
   
  
	comporator : function(a, b) {
		let aConf = 0.0;
		let bConf = 0.0;
		const name = predict_name.toLowerCase();
		const aName = a.name.toLowerCase();
		const bName = b.name.toLowerCase();

		aConf = name.length / aName.length;
		bConf = name.length / bName.length;
		
		if(aName.startsWith(name)) aConf += 2 * aConf;
		if(bName.startsWith(name)) bConf += 2 * bConf;
		if(aName.endsWith(name)) aConf += 0.2 * name.length / aName.length;
		if(bName.endsWith(name)) bConf += 0.2 * name.length / bName.length;

		return bConf - aConf
	},
  
  
	/**
	 * Проверка существования роли. Возвращает найденную роль.
	 *
	 * @param {Message} msg
	 * @param {String}  name Название роли
	 */
	has : (msg, name) => {
		name = name.toLowerCase();
		let position = 0;
		let entry = false;
  
		const roles = Array.from(roles.cache.filter(r => {
			if(!(r.color == 5095913 || r.color == 3447003 || r.color == 13084411)) return false;
			if(entry) return false;
			position = r.rawPosition;
			let role = r.name.toLowerCase();
			if(role == name) entry = true;
			return role.includes(name);
		}).values());
  
		return { position : position, roles : roles };
	},
  
  
	/**
	 * Отправляет help и отсортированный список доступных игровых ролей
	 *
	 * @param {Message} msg
	 * @param {Array}   roles Список ролей
	 * @param {String}  name  Название роли
	 */
	finded : (msg, roles, name) => {
		for(let i = 0; i < roles.length; i++) roles[i] = roles[i].name;

		const embed = new Discord.MessageEmbed()
			.setDescription('По запросу "' + name + '" найдено ' +
				roles.length + ' ' + num2str(roles.length, ['роль', 'роли', 'ролей']) +
				'\nУточните ваш запрос.')
			.addField('Список найденных ролей', roles.sort().join('\n'));
		send.error(msg, embed);
	},


	/**
	 * Проверка наличия прав на редактирование прав или наличие роли Оратор
	 *
	 * @param {Message} member
	 */
	permission : member =>
		member.permissions.has('MANAGE_ROLES') ||
		member.roles.cache.has('620194786678407181') ||
		member.roles.cache.has('809040260582998016') ||
		member.roles.cache.has('916999822693789718') ||
		member.id == '500020124515041283'
  
  };