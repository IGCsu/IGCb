const SlashOptions = require('../../BaseClasses/SlashOptions');
const BaseCommand = require('../../BaseClasses/BaseCommand');
const LangSingle = require('../../BaseClasses/LangSingle');
const { CommandInteraction, UserContextMenuInteraction, GuildMember, ButtonInteraction, ModalSubmitInteraction} = require('discord.js');

const slashOptions = require('./slashOptions');
const { title, description } = require('./about.json');

const Warn = require('./Warn');
const EmbedBuilder = require('./EmbedBuilder');
const ModalBuilder = require('./ModalBuilder');


class Warns extends BaseCommand{

	constructor(path) {
		super(path);

		this.category = 'Модерация'
		this.name = 'warn'
		this.title = title
		this.description = description
		this.slashOptions = slashOptions

		return new Promise(async resolve => {
			resolve(this);
		});
	}

	/**
	 * Обработка слеш-команды
	 * @param {CommandInteraction} int
	 */
	async slash(int){

		const subcommand = int.options.getSubcommand();

		if(subcommand === 'add'){
			if(!this.permission(int.member))
				return int.reply(EmbedBuilder.noPermissions(true));

			return int.showModal(ModalBuilder.newWarn(int, int.options.getUser('user').id))
		}

		const subcommandGroup = int.options.getSubcommandGroup();

		if(subcommandGroup === 'get'){

			if(subcommand === 'direct'){
				const warn = Warn.get(int.options.getInteger('id'));

				const msg = warn
					? await warn.getEmbed(int)
					: EmbedBuilder.noSuchWarn();

				return int.reply(msg);
			}

			if(subcommand === 'last'){
				const target = int.options.getUser('user', false);

				const warn = Warn.last(target?.id);

				const msg = warn
					? await warn.getEmbed(int)
					: (target ? EmbedBuilder.noWarns() : EmbedBuilder.noSuchWarn());

				return int.reply(msg);
			}

			if(subcommand === 'list'){
				const target = int.options.getUser('user');
				const ephemeral = int.options.getBoolean('ephemeral', false);

				let msg = await Warn.pagination(target).getEmbed(int);

				if(!msg) msg = EmbedBuilder.noWarns();
				msg.ephemeral = ephemeral

				return int.reply(msg);
			}
		}

		await int.reply({
			content: reaction.emoji.error + ' ' + int.str('In development'),
			ephemeral: true
		});
	}

	/**
	 * Обработка контекстной команды на пользователе
	 * @param {UserContextMenuInteraction} int
	 */
	async contextUser(int){
		if(!this.permission(int.member))
			return int.reply(EmbedBuilder.noPermissions(true));

		return int.showModal(ModalBuilder.newWarn(int, int.targetUser.id))
	}

	/**
	 * Обработка нажатия на кнопку
	 * @param {ButtonInteraction} int
	 */
	async button(int){
		const data = int.customId.split('|');

		if(data[1] === 'embedEditReason'){
			if(!this.permission(int.member))
				return int.reply(EmbedBuilder.noPermissions(true));

			const warn = Warn.get(data[2]);
			return int.showModal(ModalBuilder.editWarn(int, warn));
		}

		if(data[1] === 'embedPage'){
			let page = data[3];
			const target = client.users.cache.get(data[2]);

			const msg = await Warn.pagination(target, page).getEmbed(int);
			if(!msg) {
				return int.update(msg);
			} else {
				return int.reply(EmbedBuilder.noSuchWarn(true))
			}
		}

		if(data[1] === 'embedRemoveWarn'){
			if(!this.permission(int.member))
				return int.reply(EmbedBuilder.noPermissions(true));

			const warn = Warn.get(data[2]);
			warn.flags = { removed: true };
			warn.save();

			await int.update(await warn.getEmbed(int));

			return int.followUp(await EmbedBuilder.removeWarn(int, warn, true));
		}

		if(data[1] === 'embedAddWarn'){
			if(!this.permission(int.member))
				return int.reply(EmbedBuilder.noPermissions(true));

			const warn = Warn.get(data[2]);
			warn.flags = { removed: false };
			warn.save();

			await int.update(await warn.getEmbed(int));

			return int.followUp(await EmbedBuilder.removeWarn(int, warn, true));
		}

		await int.reply({
			content: reaction.emoji.error + ' ' + int.str('In development'),
			ephemeral: true
		});
	}

	/**
	 * Обработка модалки
	 * @param {ModalSubmitInteraction} int
	 */
	async modal(int){
		const data = int.customId.split('|');
		const reason = int.fields.getField('reason').value;

		if(data[1] === 'NewWarnModal'){
			const warn = new Warn({
				target: data[2],
				reason: reason,
				author: int.user.id
			});
			warn.save();

			return int.reply(await EmbedBuilder.newWarn(int, warn));
		}

		if(data[1] === 'EditWarnModal'){

			const warn = Warn.get(data[2]);
			warn.reason = reason;
			warn.save();

			await int.update(await warn.getEmbed(int));

			return int.followUp(await EmbedBuilder.editWarn(int, warn, true));
		}

		await int.reply({
			content: reaction.emoji.error + ' ' + int.str('In development'),
			ephemeral: true
		});
	}

	/**
	 * Проверка наличия роли Оратор или права управления ролями
	 *
	 * @param {GuildMember} member
	 */
	permission(member) {
		return member.roles.cache.has('916999822693789718') ||
			member.roles.cache.has('613412133715312641') ||
			member.id === '500020124515041283'
	}
}

module.exports = Warns;