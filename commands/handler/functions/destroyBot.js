module.exports = {

	active: true,

	title: {
		ru: 'Прекращение работы бота при обнаружения запуска в другом месте',
		en: 'Bot terminates when it detects running elsewhere',
		uk: 'Припинення роботи робота при виявленні запуску в іншому місці'
	},

	allChannels: false,
	allowedChannels: {
		'574997373219110922': false // #logs
	},

	init: async function(){
		return this;
	},

	call: async function(msg){
		if(msg.author.id != client.user.id) return;
		if(msg.embeds[0]?.title != 'Бот запущен') return;
		if(msg.embeds[0]?.footer?.text == hash) return;

		await msg.reply({ content : 'Прекращена работа бота-дубликата у ' + (process.env.USERNAME ?? 'Host') });

		log.error('Прекращение работы бота: бот запущен в другом месте');

		return process.kill(process.pid);
	}

}
