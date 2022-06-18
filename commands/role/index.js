const slashOptions = require('./slashOptions.json');
const { title, description } = require('./about.json');

module.exports = {

	active : true,
	category : 'Роли',

	name : 'role',
	title : title,
	description : description,
	slashOptions : slashOptions,


	init : function(){ return this; },


	/**
	 *
	 *
	 * @param {Message} msg
	 * @param {Array}   params Параметры команды
	 */
	autocomplete : async function(int){
		const timeStart = process.hrtime();
		let choices = [];

		const role = int.options.getFocused();
		const create = int.options.getBoolean('create');

		let finded = await this.has(guild.roles, role);
		let predict = finded.roles;

		if(role){
			predict.sort((a, b) => getStringSimilarityDiff(a.name, b.name, role));
			if(create) choices[0] = {name : role, value : role};
		} else {
			choices[0] = {name: localize(int.locale, 'Show list of all Game Roles'), value:'showAll'};
		}

		for(let i = 0; i < predict.length && choices.length < 25; i++) choices[i + 1 * (create || !role)] = {name : predict[i].name, value : predict[i].id};

		try{
			await int.respond(choices);
		} catch(e){
			const timeEnd = process.hrtime(timeStart);
			const timePerf = (timeEnd[0]*1000) + (timeEnd[1] / 1000000);
			console.warn('Autocomplete Interaction Failed: ' + timePerf + 'ms' + '\n' + e)
		}
	},

	slash : async function(int){
		const member = int.member;
		const permission = this.permission(member)

		if(int.options.get('role').value === 'showAll')
			return await int.reply({embeds:[this.help()]});

		let role = int.guild.roles.cache.get(int.options.get('role').value);
		const create = int.options.getBoolean('create');
		let members = int.options.get('members')?.value;
		if(members)
			members = members.replace(/[^-_\w]/g, ' ').match(/[0-9]+/g);

		if(!role) {
			if (permission && create){
			role = (await this.create(member, int.options.get('role').value, 45)).role
			await int.reply({content: reaction.emoji.success + ' Роль <@&' + role.id + '> создана', allowed_mentions: { "parse": [] }})
			} else {
			return await int.reply({content: reaction.emoji.error + ' ' + localize(int.locale, 'Role not found'), allowedMentions: { "parse": [] }, ephemeral: true})
			}
		}


		if(!members || !permission){
			toggleRole(role, member, int.member).then(result => {
				int.reply({ content: reaction.emoji.success + ' ' + result, allowedMentions: {parse: []}});
			}).catch(result => {
				int.reply({ content: reaction.emoji.error + ' ' + result, ephemeral: true});
			});
		}else{
			int.reply({ content: 'Запускаю выдачу ролей', allowedMentions: { parse: [] } });

			members.forEach(user => {
				toggleRole(role, user, member).then(result => {
					int.followUp({ content: reaction.emoji.success + ' ' + result, allowedMentions: {parse: []} });
				}).catch(result => {
					int.followUp({ content: reaction.emoji.error + ' ' + result, allowedMentions: {parse: []}, ephemeral : true});
				});
			});
		}
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


		const embed = new Discord.MessageEmbed()
			.setTitle('Игровые роли')
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
	create : async function(member, name, pos){
		name = name[0].toUpperCase() + name.slice(1);

		const role = await guild.roles.create({
			name : name,
			mentionable : true,
			color : 5095913,
			position : pos,
			reason : 'По требованию ' + member2name(member, 1)
		});
		return { role : role , chk: true};
	},


	/**
	 * Проверка существования роли. Возвращает найденную роль.
	 *
	 * @param {Message} msg
	 * @param {String}  name Название роли
	 */
	has : (roles, name) => {
		name = name.toLowerCase();
		let position = 0;
		let entry = false;

		const curr_roles = Array.from(roles.cache.filter(r => {
			if(!(r.color == 5095913 || r.color == 3447003)) return false;
			if(entry) return false;
			position = r.rawPosition;
			let role = r.name.toLowerCase();
			if(role == name) entry = true;
			return role.includes(name);
		}).values());

		return { position : position, roles : curr_roles };
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
