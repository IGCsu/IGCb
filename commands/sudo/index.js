const slashOptions = require('./slashOptions.json');
const { title, description } = require('./about.json');
const { CommandInteraction, GuildMember, AutocompleteInteraction, Role} = require('discord.js');

module.exports = {

	active: true,
	category: 'Утилиты',

	name: 'sudo',
	title: title,
	description: description,
	slashOptions: slashOptions,

	init: async function () {
		return this;
	},

	/**
	 *
	 * @param int {CommandInteraction}
	 */
	slash: async function (int){
		if(!this.permission(int.member)) return int.reply({content: int.str('Missing access'), ephemeral: true});

		const module = int.options.getString('module', false);
        if(!commands[module] && module) return int.reply({content: reaction.emoji.error + ' Модуль не найден', ephemeral: true});
		if(module === 'sudo') return int.reply({content: reaction.emoji.error + ' Невозможно исполнить c этим модулем', ephemeral: true});

		if(int.options.getSubcommand() === 'pause'){

			if(!int.options.getBoolean('forced')){
				if(module){
					await this.switchPauses(module);
					return int.reply({content: reaction.emoji.success + ` Модуль успешно ${module + (!commands[module].active ? ' приостановлен': ' возобновлён')}`});
				} else {
                    client.paused = !Boolean(client.paused);
					for(let cmd in commands){
						await this.switchPauses(cmd);
					}
					return int.reply({content: reaction.emoji.success + ` Бот успешно${client.paused ? ' приостановлен': ' возобновлён'}`});
				}
			} else {
				if(module){

				}
			}
		}
		if(int.options.getSubcommand() === 'perms_migration'){
			const ref = int.options.getRole('reference').id;
			const tar = int.options.getRole('target').id;
			return int.reply({
				content: `**__Это действие не может быть отменено!__**\n\nВы уверены что хотите перенести права из <@&${ref}> в <@&${tar}>?`,
				components: [{
					type: 1,
					components:[{
						type: 2,
						style: 4,
						label: 'Подтвердить',
						customId: 'sudo|confirmMigration|' + ref + '|' + tar
					}]
				}],
				ephemeral: true
			})
		}

		await int.reply({content: 'In development', ephemeral: true})
	},

	button: async function(int){
		await int.reply({content: 'In development', ephemeral: true})
	},

    /**
     *
     * @param int {AutocompleteInteraction}
     * @return {Promise<void>}
     */
    autocomplete: async function(int){
        const query = int.options.getFocused();
        console.log(query)
        let choices = [];

        for(let mod in commands){
            choices.push({name: mod, value: mod});
        }
        choices.sort((a, b) => {return getStringSimilarityDiff(a.name, b.name, query)})

        await int.respond(choices)
    },

	switchPauses: async function(module, targetState = undefined){
		if(module === 'sudo') return;
        if(!targetState) targetState = !commands[module].active;
		commands[module].active = targetState;
		if('switchPause' in commands[module]) await commands[module].switchPause(targetState);
	},

	/**
	 *
	 * @param reference {Role}
	 * @param target	{Role}
	 */
	migrateRole2Role: async function(reference, target){
		await target.setPermissions(reference.permissions);

		for(channel of (await guild.channels.fetch())){
			if(channel.permissionOverwrites.cache[reference.id])
				await channel.permissionOverwrites.edit(target, channel.permissionOverwrites.cache[reference.id])
		}
	},

	/**
	 *
	 * @param member {GuildMember}
	 */
	permission: member =>
		member.id === '500020124515041283' ||
		member.id === '256114365894230018',
}