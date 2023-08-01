/**
 * Выбирает активное сообщество
 */
module.exports = async () => {
	global.guild = await client.guilds.fetch(constants.HOME);
	console.log('Selected guild "' + guild.name + '"');
};

