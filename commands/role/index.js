const SlashOptions = require('../../BaseClasses/SlashOptions');
const AutocompleteChoices = require('../../BaseClasses/AutocompleteChoices');
const BaseCommand = require('../../BaseClasses/BaseCommand');
const LangSingle = require('../../BaseClasses/LangSingle');
const {
	GuildMember,
	AutocompleteInteraction,
	CommandInteraction,
	Role
} = require('discord.js');

const slashOptions = require('./slashOptions');
const { title, description } = require('./about.json');

class Roles extends BaseCommand {

	constructor (path) {
		super(path);

		this.category = 'Роли';
		this.name = 'role';
		this.title = new LangSingle(title);
		this.description = new LangSingle(description);
		this.slashOptions = slashOptions;

		return new Promise(async resolve => {
			resolve(this);
		});
	}

	/**
	 * @param {AutocompleteInteraction} int
	 */
	async autocomplete (int) {
		const timeStart = process.hrtime();
		let choices = new AutocompleteChoices();

		const role = int.options.getFocused();
		const create = int.options.getBoolean('create');

		let finded = this.has(guild.roles, role);

		for(let entry of finded.roles){
			choices.push({name: entry.name, value: entry.id})
		}

		if(role){
			choices = choices.sort(role);
			if(create) choices.unshift({name : role, value : role});
		} else {
			choices.unshift({name: int.str('Show list of all Game Roles'), value:'showAll'});
		}
		try{
			await int.respond(choices.slice(0, 24));
		} catch(e){

			const timeEnd = process.hrtime(timeStart);
			const timePerf = (timeEnd[0] * 1000) + (timeEnd[1] / 1000000);
			console.warn(
				'Autocomplete Interaction Failed: ' + timePerf + 'ms' + '\n' + e
			);
		}
	}

	/**
	 * @param {CommandInteraction} int
	 */
	async slash (int) {
		console.time('1')
		const member = int.member;
		const permission = this.permission(member);

		if (int.options.get('role').value === 'showAll') {
			return int.reply({ embeds: [this.help()] });
		}

		let role = int.guild.roles.cache.get(int.options.get('role').value);
		const create = int.options.getBoolean('create');
		let members = int.options.get('members')?.value;
		if (members) {
			members = members.replace(/[^-_\w]/g, ' ').match(/[0-9]+/g);
		}
		console.timeEnd('1')
		console.time('2')
		if (!role) {
			if (permission && create) {
				role = (await this.create(
					member,
					int.options.get('role').value,
					45
				)).role;
				int.reply({
					content: reaction.emoji.success + ' Роль <@&' + role.id + '> создана',
					allowed_mentions: constants.AM_NONE
				});
			} else {
				return int.reply({
					content: reaction.emoji.error + ' ' + int.str('Role not found'),
					allowedMentions: constants.AM_NONE,
					ephemeral: true
				});
			}
		}
		console.timeEnd('2')
		console.time('3')
		if (!members || !permission) {
			toggleRole(role, member, int.member).then(result => {
				int.reply({
					content: reaction.emoji.success + ' ' + result,
					allowedMentions: constants.AM_NONE
				});
			}).catch(result => {
				int.reply({
					content: reaction.emoji.error + ' ' + result,
					ephemeral: true
				});
			});
		} else {
			if (!int.replied) {
				int.reply({
					content: 'Запускаю выдачу ролей',
					allowedMentions: constants.AM_NONE
				}).catch(e => {console.log(e)});
			}

			members.forEach(user => {
				toggleRole(role, user, member).then(result => {
					int.followUp({
						content: reaction.emoji.success + ' ' + result,
						allowedMentions: constants.AM_NONE
					});
				}).catch(result => {
					int.followUp({
						content: reaction.emoji.error + ' ' + result,
						allowedMentions: constants.AM_NONE,
						ephemeral: true
					});
				});
			});
		}
		console.timeEnd('3')
	}

	/**
	 * Отправляет help и отсортированный список доступных игровых ролей
	 *
	 * @param {Message} msg
	 */
	help () {
		let roles = [];

		guild.roles.cache.forEach(role => {
			if (
				role.color === 5095913 ||
				role.color === 3447003 ||
				role.color === 13084411
			) {
				roles.push(role.name);
			}
		});


		return new Discord.MessageEmbed()
			.setTitle('Игровые роли')
			.setColor('BLURPLE')
			.addField('Список доступных ролей', roles.sort().join('\n'));
	}


	/**
	 * Создание роли
	 *
	 * @param {GuildMember} member
	 * @param {String}  name Название роли
	 * @param {Number}  pos  Позиция роли
	 */
	async create (member, name, pos) {
		name = name[0].toUpperCase() + name.slice(1);

		const role = await guild.roles.create({
			name: name,
			mentionable: true,
			color: 5095913,
			position: pos,
			reason: 'По требованию ' + member.toName(true)
		});
		return { role: role, chk: true };
	}


	/**
	 * Проверка существования роли. Возвращает найденную роль.
	 *
	 * @param {Array<Role>} roles
	 * @param {String}  name Название роли
	 */
	has (roles, name) {
		name = name.toLowerCase();
		let position = 0;
		let entry = false;

		const curr_roles = Array.from(roles.cache.filter(r => {
			if (r.color !== 5095913 && r.color !== 3447003) return false;
			if (entry) return false;
			position = r.rawPosition;
			let role = r.name.toLowerCase();
			if (role === name) entry = true;
			return role.includes(name);
		}).values());

		return { position: position, roles: curr_roles };
	}


	/**
	 * Проверка наличия прав на редактирование прав или наличие роли Оратор
	 * @param {GuildMember} member
	 */
	permission (member) {
		return member.permissions.has('MANAGE_ROLES') ||
			member.roles.cache.has('620194786678407181') ||
			member.roles.cache.has('809040260582998016') ||
			member.roles.cache.has('916999822693789718') ||
			member.id === '500020124515041283';
	}

}

module.exports = Roles;
