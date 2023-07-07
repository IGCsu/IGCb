module.exports = {

	active: true,

	title: {
		ru: 'Автоматическое выдача alive',
		en: 'Automatic issuance of alive',
		uk: 'Автоматичне видача alive'
	},

	allChannels: false,

	allowedChannels: {
		'648775464545943602': false // #welcome
	},

	init: async function () {
		this.role = await guild.roles.fetch('648762974277992448');
		client.on('guildMemberAdd', member => this.addRole(member))

		return this;
	},

	addRole: async function (member) {
		if (!member.user.bot && !member.roles.cache.has(this.role.id)) {
			toggleRole(this.role, member);
		}
	},

	call: async function (msg) {
		if (!msg.member.user.bot && !msg.member.roles.cache.has(this.role.id)) {
			toggleRole(this.role, msg.member).then(result => {
				msg.reply({
					content: reaction.emoji.success + ' ' + result,
					allowedMentions: constants.AM_NONE
				});
			});
		}
	}

};
