const slashOptions = require('./slashOptions.json');
const { title, description } = require('./about.json');
const { CommandInteraction, GuildMember, AutocompleteInteraction} = require('discord.js');

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
	 * @param member {GuildMember}
	 */
	permission: member =>
		member.id === '500020124515041283' ||
		member.id === '256114365894230018',
}