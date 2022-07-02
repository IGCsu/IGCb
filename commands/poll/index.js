const { Collection } = require('@discordjs/collection');
const slashOptions = require('./slashOptions.json');
const { title, description } = require('./about.json');

module.exports = {

	active : true,
	category : 'Инструменты',

	name : 'poll',
	title : title,
	description : description,
	slashOptions : slashOptions,

	FLAGS : {
		POLLS: {
			PRIVATE: 1,
			PUBLIC: 2,
			CLOSED: 4,
		},
		ANSWERS: {
			DISAGREE: 1,
			SPAM: 2,
		}
	},


	init : function(){
		const data = this.fetchAll();
		this.polls = new Collection();
		data[0].forEach((poll) =>{
			this.polls.set(poll.id, {id: poll.id, question: poll.question, min: poll.min, max: poll.max, flags: poll.flags})
		});
		this.pollsAnswers = new Collection();
		data[1].forEach((poll) =>{
			this.pollsAnswers.set(poll.user_id + '|' + poll.poll_id, {user_id: poll.user_id, poll_id: poll.poll_id, answer: poll.answer, flags: poll.flags})
		});
		return this;
	},

	/**
	 * @param {Object} int CommandInteraction
	 */
	slash : async function(int){
        const type = int.options.getSubcommand();
        if(type === 'common' || type === 'senate'){
            const question = int.options.getString('question');
			const min = int.options.getInteger('min') ?? 0;
			const isPublic = int.options.getBoolean('public') ?? true;
            const txt = (type === 'common' ? 'Общий' : 'Закрытый');
			let flags = 0;
			flags += (type === 'common' ? 0 : this.FLAGS.POLLS.PRIVATE);
			flags += (isPublic ? this.FLAGS.POLLS.PUBLIC : 0);
			if(min > 1000){
				return await int.reply({content: localize(int.locale, 'The minimum number of characters exceeds the maximum'), ephemeral: true})
			} else {
            	const message = await int.reply({content: `${txt} опрос: ${question}`, components:
				[
					{
						type : 1, components:
						[
							{
								type : 2,
								style: 3,
								customId:'poll|yes',
								label:'За'
							},
							{
								type : 2,
								style: 4,
								customId:'poll|no',
								label:'Против'
							},
							{
								type : 2,
								style: 2,
								customId:'poll|result',
								label:'Результаты'
							}
						]
					}
				],
					allowedMentions:{parse:["users", "roles"]},
					fetchReply: true
				})
				this.createPoll(message.id, question, min, 1000, flags);
			}
		} else {
			const eph = int.options.getBoolean('ephemeral') ?? true;
			await int.deferReply({ephemeral: eph});
			const search = int.options.getString('search')?.split('|');
			
			if(search){
				if(search[0] === 'poll') return int.editReply({content: await this.getPollResultsContent(search[1], int)});
				if(search[0] === 'answer') return int.editReply({content: this.getPollAnswerContent(search[1], search[2], int)});
			}
			int.reply({content: localize(int.locale, 'In development'), ephemeral: true});
		}
    },

	/**
	 * @param {Object} int ButtonInteraction
	 */
    button : async function(int){
		const resp = int.customId.split('|')[1]
        if(resp === 'result') await int.deferReply({ephemeral: true});
		const poll = this.fetchPoll(int.message.id);
		if(resp === 'result') {
			if(!poll) if(!poll) return int.editReply({content: localize(int.locale, 'This poll was not found in the database'), ephemeral: true});
			const content = await this.getPollResultsContent(int.message.id, int);
			try{
				return await int.editReply({content: content, ephemeral: true});
			} catch(e){
				return console.log(e);
			}
		}
		const answer = this.fetchPollAnswer(int.member.user.id, int.message.id);
		const value = answer ? answer.answer : undefined;
		if(!poll) int.reply({content: localize(int.locale, 'This poll was not found in the database'), ephemeral: true});
		const isPrivate = poll.flags & this.FLAGS.POLLS.PRIVATE;
		if(isPrivate && !(int.member.roles.cache.get('916999822693789718') || int.member.roles.cache.get('613412133715312641'))){
			return await int.reply({content: localize(int.locale, 'Access denied'), ephemeral: true})
		}

		const min = poll.min;

		await int.showModal({
			title: localize(int.locale, value ? 'Confirm your vote changes' : 'Confirm your vote'),
			customId: 'poll|' + resp,
			components:[{
				type: 1,
				components:[{
					type: 4,
					customId: 'opininon',
					label: localize(int.locale, 'Why you choose') + ' \"' + localize(int.locale, ((resp === 'yes') ? 'yes': 'no')) + '\"',
					style: 2,
					value: value,
					min_length: min,
					max_length: 1000,
					placeholder: localize(int.locale, 'Enter your valuable opinion'),
					required: min !== 0
				}]
			}],

		})
    },
	modal : async function(int){
		const type = int.customId.split('|')[1];
		let txt
		console.log(`\x1b[33m${int.message.content} ${int.member.user.username} ${(type === 'yes') ? 'за' : 'против'}:\x1b[0m ${int.components[0].components[0].value}`)
		if(!this.fetchPollAnswer(int.member.user.id, int.message.id)){
			this.createPollAnswer(int.member.user.id, int.message.id, int.components[0].components[0].value, (type === 'yes') ? 0 : this.FLAGS.ANSWERS.DISAGREE)
			txt = localize(int.locale, 'Vote submmited');
		} else {
			this.updatePollAnswer(int.member.user.id, int.message.id, {awnser: int.components[0].components[0].value, flags: (type === 'yes') ? 0 : this.FLAGS.ANSWERS.DISAGREE})
			txt = localize(int.locale, 'Vote changed');
		}
		await int.reply({ content: txt, ephemeral: true })
	},

	autocomplete : async function(int){
		let choices = [];
		const searchRequest = int.options.getFocused();
		const ids = searchRequest.replace(/[^-_\w]/g, ' ').match(/[0-9]+/g);

		if(ids){
			let polls = [];
			let pollsAnswers;
			let answers = [];
			ids.forEach((id => {
				if(this.polls.get(id)) polls.push({value: 'poll|' + id, name: ((this.polls.get(id)?.question.length > 90) ? (this.polls.get(id)?.question.slice(0, 90) + '...') : this.polls.get(id)?.question)});
				pollsAnswers = this.pollsAnswers.filter(answer => answer.user_id === id);
				pollsAnswers.forEach(answer => {
					answers.push({value: 'answer|' + id + '|' + answer.poll_id, name: (answer.flags & this.FLAGS.ANSWERS.DISAGREE ? 'ПРОТИВ ' : 'ЗА ') + ((answer.answer !== '') ? (answer.answer.length > 90 ? (answer.answer.slice(0, 90) + '...') : answer.answer) : 'Без ответа')})
				})
			}))
			await int.respond((choices.concat(polls)).concat(answers));
		}
	},

	fetchPoll: function (message_id) {
		return DB.query(`SELECT * FROM polls WHERE id = "${message_id}";`)[0];
	},

	getPoll: function (message_id) {
		return this.polls[message_id];
	},

	createPoll: function (message_id, question, min=0, max=0, flags=0) {
		this.polls.set(message_id, {id: message_id, question: question, min: min, max: max, flags: flags});
		return DB.query(`INSERT INTO polls VALUES ('${message_id}', '${question}', ${min}, ${max}, ${flags});`)[0];
	},

	updatePoll: function (message_id, data) {
		const old = this.polls.get(message_id);
		if(data.question !== undefined){
			data.question = `question = '${data.question}'`;
		}
		if(data.min !== undefined){
			data.min = `${(data.question) !== undefined ? ',' : ''} min = ${data.min}`;
		}
		if(data.max !== undefined){
			data.max = `${(data.question + data.min) !== undefined ? ',' : ''} max = ${data.max}`;
		}
		if(data.flags !== undefined){
			data.flags = `${(data.question + data.min + data.min) !== undefined ? ',' : ''} flags = ${data.flags}`;
		}
		this.polls.set(message_id, {id: message_id, question: data.question ?? old.question, min: data.min ?? old.min, max: data.max ?? old.max, flags: data.flags ?? old.flags});
		return DB.query(`UPDATE polls SET ${data.question}${data.min}${data.max}${data.flags} WHERE id = '${message_id}';`)[0];
	},

	fetchPollAnswer: function (user_id, message_id) {
		return DB.query(`SELECT * FROM poll_answers WHERE poll_id = '${message_id}' AND user_id = '${user_id}';`)[0];
	},

	getPollAnswer: function (message_id, user_id) {
		return this.pollsAnswers.get(user_id + '|' + message_id);
	},

	fetchPollResults: function (message_id) {
		return {result: DB.query(`SELECT * FROM poll_answers WHERE poll_id = "${message_id}";`),
		yes: DB.query(`SELECT COUNT(*) FROM poll_answers WHERE poll_id = "${message_id}" AND flags = 0;`)[0]['COUNT(*)'],
		no: DB.query(`SELECT COUNT(*) FROM poll_answers WHERE poll_id = "${message_id}" AND flags = 1;`)[0]['COUNT(*)']};
	},
	createPollAnswer: function (user_id, message_id, answer='', flags=0) {
		this.pollsAnswers.set(user_id + '|' + message_id, {user_id: user_id, poll_id: message_id, answer: answer, flags: flags})
		return DB.query(`INSERT INTO poll_answers VALUES ('${user_id}', '${message_id}', '${answer}', ${flags});`)[0];
	},
	updatePollAnswer: function (user_id, message_id, data) {
		const old = this.pollsAnswers.get(user_id + '|' + message_id);
		if(data.answer !== undefined){
			data.answer = `answer = "${data.answer}"`;
		} else {
			data.answer = '';
		}
		if(data.flags !== undefined){
			data.flags = `${data.answer !== '' ? ',' : ''}flags = ${data.flags}`;
		}
		this.pollsAnswers.set(user_id + '|' + message_id, {user_id: user_id, poll_id: message_id, answer: data.answer ?? old.answer, flags: data.flags ?? old.flags})
		return DB.query(`UPDATE poll_answers SET ${data.answer}${data.flags} WHERE poll_id = ? AND user_id = ?;`, [message_id, user_id])[0];
	},
	fetchAll: function () {
		return [DB.query(`SELECT * FROM polls;`),
		DB.query(`SELECT * FROM poll_answers;`)];
	},

	getAll: function () {
		return [this.polls,
		this.pollsAnswers];
	},

	getPollAnswerContent: function (user_id, message_id, int=undefined) {
		const poll = this.fetchPoll(message_id);
		const answer = this.fetchPollAnswer(user_id, message_id);
		let content = localize(int.locale, 'Vote not found');
		if(answer){
			content = `${poll.question}\n<@${user_id}> ${(answer.flags & this.FLAGS.ANSWERS.DISAGREE) ? 'против' : 'за'}\n\`\`\`ansi\n${answer.answer}\`\`\``
		}
		return content;
	},
	getPollResultsContent: async function (message_id, int=undefined) {
		const poll = this.fetchPoll(message_id);
		const results = this.fetchPollResults(message_id);
		let content = localize(int.locale, 'There are no votes yet');
		let votes = '';
		if(results.result.length){
			if(poll.flags & this.FLAGS.POLLS.PUBLIC){
				results.result.sort((a, b) => {return (a.flags & this.FLAGS.ANSWERS.DISAGREE) - (b.flags & this.FLAGS.ANSWERS.DISAGREE)})
				for (let vote of results.result)  {
					vote.answer = vote.answer.replace('\n', ' _ ')
					votes += ((vote.flags & this.FLAGS.ANSWERS.DISAGREE) ? '[0;41m✖[0m ' : '[0;45m✓[0m ') +
						`${member2name((await guild.members.cache.get(vote.user_id)))} ` + truncate(vote.answer, 60) + '\n';
				}
			}
			content =
			'```ansi\n' +
			`${localize(int.locale, 'no')} ${results.no} [[0;41m${' '.repeat(Math.round((results.no/results.result.length)*20))}[0;45m${' '.repeat(Math.round((results.yes/results.result.length)*20))}[0m] ${results.yes} ${localize(int.locale, 'yes')}\n` + votes +
			'```';
		}
		return content;
	},
};
