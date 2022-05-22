const localize = require("../functions/localize");

module.exports = {

	active : true,
	category : 'Утилиты',

	name : 'help',
	title : 'Помощь по командам',
	description : 'Показывает список доступных команд или описание указанной команды',

	init : function(){ return this; },

	/**
	 * Генерирует эмбед со списком команд
	 *
	 * @return {MessageEmbed}
	 */
	call : async function(){

		let help = {};

		for(let c in commands){
			const category = commands[c].category ? commands[c].category : 'Остальные'

			if(!help.hasOwnProperty(category)) help[category] = [];
			help[category].push( this.getCommand(commands[c]) );
		}

		let embed = new Discord.MessageEmbed()
			.setTitle('Модули бота')
			.setColor('BLURPLE');

		for(let c in help){
			embed.addField(c, help[c].sort().join('\n'));
		}

		return embed;

	},

	/**
	 * Обработка слеш-команды
	 * @param {CommandInteraction} int Команда пользователя
	 */
	slash : async function(int){
		const command = int.options.getString('command');

		const embed = command ? await his.command(command) : await this.call();

		await int.reply({ embeds : [embed], fetchReply: true });
	},


	getCommand : c => (reaction.emoji[ c.active ? 'success' : 'error' ]) + ' `' + c.name + '` - ' + c.title,

};
