const { Collection } = require('@discordjs/collection');

module.exports = {

	active : true,
	name : 'poll',
	title : 'Опросы',
	description : 'Позволяет создавать общие и модераторские опросы',
	descriptionShort : 'Позволяет создавать общие и модераторские опросы',
	description_localizations : {'ru': 'Allows you to create common and moderator polls', 'uk': 'Дозволяє створювати загальні та модераторські опитування'},

	category : 'Утилиты',

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

	slashOptions : [
		{
			name : 'common',
			name_localizations : {'ru': 'общий', 'uk': 'загальний'},
			description : 'Сommon poll',
			type : 1,
			options : [
				{
					name : 'question',
					name_localizations : {'ru': 'вопрос', 'uk': 'питання'},
					description : 'Ask a question',
					description_localizations : {'ru': 'Задайте вопрос', 'uk': 'Задайте питання'},
					type : 3,
					required : true,
				},
				{
					name : 'min',
					name_localizations : {'ru': 'мин', 'uk': 'мін'},
					description : 'The minimum required number of characters in the answer. (0 - the answer is optional)',
					description_localizations : {'ru': 'Минимально необходимое количество символов в ответе. (0 - ответ не обязателен)', 'uk': 'Мінімальна кількість символів у відповіді. (0 - відповідь не обов\'язкова)'},
					type : 4,
					required : false,
				},
				{
					name : 'public',
					name_localizations : {'ru': 'публичный', 'uk': 'публічний'},
					description : 'Если false, то опрос будет анонимным',
					description_localizations : {'ru': 'If false, the poll will be anonymous', 'uk': 'Якщо false, опитування - анонімне'},
					type : 5,
					required : false
				},
			]
		},
		{
			name : 'senate',
			description : 'Moderator poll',
			description_localizations : {'ru': 'Опрос среди модераторов', 'uk': 'Опитування модерації'},
			type : 1,
			options : [
				{
					name : 'question',
					name_localizations : {'ru': 'вопрос', 'uk': 'питання'},
					description : 'Ask a question',
					description_localizations : {'ru': 'Задайте вопрос', 'uk': 'Задайте питання'},
					type : 3,
					required : true,
				},
				{
					name : 'min',
					name_localizations : {'ru': 'мин', 'uk': 'мін'},
					description : 'The minimum required number of characters in the answer. (0 - the answer is optional)',
					description_localizations : {'ru': 'Минимально необходимое количество символов в ответе. (0 - ответ не обязателен)', 'uk': 'Мінімальна кількість символів у відповіді. (0 - відповідь не обов\'язкова)'},
					type : 4,
					required : false,
				},
				{
					name : 'public',
					name_localizations : {'ru': 'публичный', 'uk': 'публічний'},
					description : 'Если false, то опрос будет анонимным',
					description_localizations : {'ru': 'If false, the poll will be anonymous', 'uk': 'Якщо false, опитування - анонімне'},
					type : 5,
					required : false
				},
			]
		},
		{
			name : 'show',
			description : 'Show information about any poll',
			description_localizations : {'ru': 'Показать информацию о любом опросе', 'uk': 'Відобразити результати опитування'},
			type : 1,
			options : [
				{
					name : 'search',
					name_localizations : {'ru': 'искать', 'uk': 'шукати'},
					description : 'Specify any information that may be related to the poll',
					description_localizations : {'ru': 'Укажите любую информацию которая может быть связана с опросом', 'uk': 'Вкажіть опис опитування'},
					type : 3,
					autocomplete: true,
					required : true,
				}
			]
		},
	],

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
        if(type == 'common' || type == 'senate'){
            const question = int.options.getString('question');
			const min = int.options.getInteger('min') ?? 0;
			const public = int.options.getBoolean('public') ?? true;
            const txt = (type == 'common' ? 'Общий' : 'Закрытый');
			let flags = 0;
			flags += (type == 'common' ? 0 : this.FLAGS.POLLS.PRIVATE);
			flags += (public ? this.FLAGS.POLLS.PUBLIC : 0);
			if(min > 1000){
				await int.reply({content: 'Минимальное количество превышает максимальное'})
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
					allowedMentions:{parse:[]},
					fetchReply: true
				})
				this.createPoll(message.id, question, min, 1000, flags);
			};
		} else {
			const search = int.options.getString('search')?.split('|');
			if(search){
				if(search[0] == 'poll') return int.reply({content: this.getPollResultsContent(search[1]), ephemeral: true});
			};
			int.reply({content: 'В разработке', ephemeral: true});
		};
    },

	/**
	 * @param {Object} int ButtonInteraction
	 */
    button : async function(int){
        //int.reply({content: 'В разработке', ephemeral: true});
		const answer = this.fetchPollAnswer(int.member.user.id, int.message.id);
		const value = answer ? answer.answer : undefined;
		const poll = this.fetchPoll(int.message.id);
		if(!poll) return int.reply({content: 'Этот опрос не найден в базе данных', ephemeral: true});
		const resp = int.customId.split('|')[1]
		const private = poll.flags & this.FLAGS.POLLS.PRIVATE;
		if(private && !(int.member.roles.cache.get('916999822693789718') || int.member.roles.cache.get('613412133715312641'))){
			return await int.reply({content: 'Отказано в достпуе', ephemeral: true})
		}

		const min = poll.min;

		if(resp == 'result') {
			await int.deferReply({ephemeral: true});
			const content = this.getPollResultsContent(int.message.id);
			try{
				return await int.editReply({content: content, ephemeral: true});
			} catch(e){
				console.log(e);
			}
		};

		await client.api.interactions(int.id, int.token).callback.post({
			data:{
				type: 9,
				data: {
					title: `${value ? 'Изменение' : 'Подтверждение'} голоса`,
					custom_id: 'poll|' + resp,
					components:[{
						type: 1,
						components:[{
							type: 4,
							custom_id: 'opininon',
							label: 'Почему вы выбрали именно \"' + ((resp == 'yes') ? 'За': 'Против') + '\"',
							style: 2,
							value: value,
							min_length: min,
							max_length: 1000,
							placeholder: 'Введите ваше ценное мнение',
							required: min != 0
						}]
					}],
				}
			}
		})
    },
	modal : async function(int){
		const type = int.data.custom_id.split('|')[1];
		let txt = ''
		console.log(`\x1b[33m${int.message.content} ${int.member.user.username} ${(type == 'yes') ? 'за' : 'против'}:\x1b[0m ${int.data.components[0].components[0].value}`)
		if(!this.fetchPollAnswer(int.member.user.id, int.message.id)){
			this.createPollAnswer(int.member.user.id, int.message.id, int.data.components[0].components[0].value, (type == 'yes') ? 0 : this.FLAGS.ANSWERS.DISAGREE)
			txt = 'подтверждён';
		} else {
			this.updatePollAnswer(int.member.user.id, int.message.id, int.data.components[0].components[0].value, (type == 'yes') ? 0 : this.FLAGS.ANSWERS.DISAGREE)
			txt = 'изменён';
		}
		await client.api.interactions(int.id, int.token).callback.post({
			data:{
				type: 4,
				data: {
					content: 'Голос ' + txt,
					flags: 64
				}
			}
		})
	},

	autocomplete : async function(int){
		let choices = [];
		const searchRequest = int.options.getFocused();
		const IDs = searchRequest.replace(/[^-_\w]/g, ' ').match(/[0-9]+/g);

		if(IDs){
			let polls = [];
			let pollsAnswers;
			let answers = [];
			IDs.forEach((ID => {
				if(this.polls.get(ID)) polls.push({value: 'poll|' + ID, name: ((this.polls.get(ID)?.question.length > 90) ? (this.polls.get(ID)?.question.slice(0, 90) + '...') : this.polls.get(ID)?.question)});
				pollsAnswers = this.pollsAnswers.filter(answer => answer.user_id == ID);
				pollsAnswers.forEach(answer => {
					answers.push({value: 'answer|' + ID, name: (answer.flags & this.FLAGS.ANSWERS.DISAGREE ? 'ПРОТИВ ' : 'ЗА ') + ((answer.answer != '') ? (answer.answer.length > 90 ? (answer.answer.slice(0, 90) + '...') : answer.answer) : 'Без ответа')})
				})
			}))
			await int.respond((choices.concat(polls)).concat(answers));
		};
	},

	fetchPoll: function (message_id) {
		return DB.query(`SELECT * FROM polls WHERE id = '${message_id}';`)[0];
	},

	getPoll: function (message_id) {
		return this.polls[message_id];
	},

	createPoll: function (message_id, question, min=0, max=0, flags=0) {
		this.polls[message_id] = {question: question, min: min, max: max, flags: flags};
		return DB.query(`INSERT INTO polls VALUES ('${message_id}', '${question}', ${min}, ${max}, ${flags});`)[0];
	},

	updatePoll: function (message_id, data) {
		const old = this.polls[message_id];
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
		this.polls[message_id] = {question: data.question ?? old.question, min: data.min ?? old.min, max: data.max ?? old.max, flags: data.flags ?? old.flags};
		return DB.query(`UPDATE polls SET ${data.question}${data.min}${data.max}${data.flags} WHERE id = '${message_id}';`)[0];
	},

	fetchPollAnswer: function (user_id, message_id) {
		return DB.query(`SELECT * FROM poll_answers WHERE poll_id = '${message_id}' AND user_id = '${user_id}';`)[0];
	},

	getPollAnswer: function (message_id, user_id) {
		return this.pollsAnswers[user_id + '|' + message_id];
	},

	fetchPollResults: function (message_id) {
		return {result: DB.query(`SELECT * FROM poll_answers WHERE poll_id = '${message_id}';`),
		yes: DB.query(`SELECT COUNT(*) FROM poll_answers WHERE poll_id = '${message_id}' AND flags = 0;`)[0]['COUNT(*)'],
		no: DB.query(`SELECT COUNT(*) FROM poll_answers WHERE poll_id = '${message_id}' AND flags = 1;`)[0]['COUNT(*)']};
	},
	createPollAnswer: function (user_id, message_id, answer='', flags=0) {
		this.pollsAnswers[user_id + '|' + message_id] = {answer: answer, flags: flags};
		return DB.query(`INSERT INTO poll_answers VALUES ('${user_id}', '${message_id}', '${answer}', ${flags});`)[0];
	},
	updatePollAnswer: function (user_id, message_id, data) {
		const old = this.pollsAnswers[user_id + '|' + message_id];
		if(data.answer !== undefined){
			data.answer = `answer = '${data.answer}'`;
		}
		if(data.flags !== undefined){
			data.flags = `${data.answer !== undefined ? ',' : ''} flags = ${data.flags}`;
		}
		this.pollsAnswers[user_id + '|' + message_id] = {answer: data.answer ?? old.answer, flags: data.flags ?? old.flags};
		return DB.query(`UPDATE poll_answers SET ${data.answer}${data.flags} WHERE poll_id = '${message_id}' AND user_id = '${user_id}';`)[0];
	},
	fetchAll: function () {
		return [DB.query(`SELECT * FROM polls;`),
		DB.query(`SELECT * FROM poll_answers;`)];
	},

	getAll: function () {
		return [this.polls,
		this.pollsAnswers];
	},

	getPollResultsContent: function (message_id) {
		const poll = this.fetchPoll(message_id);
		const results = this.fetchPollResults(message_id);
		let content = 'Голосов пока нет';
		let votes = '';
		if(results.result.length){
			if(poll.flags & this.FLAGS.POLLS.PUBLIC){
				results.result.forEach(vote => {
					vote.answer = vote.answer.replace('\n', ' _ ')
					votes += ((vote.flags & this.FLAGS.ANSWERS.DISAGREE) ? '[0;41m✖[0m ' : '[0;45m✓[0m ') + `${guild.members.cache.get(vote.user_id)?.displayName ?? vote.user_id} ` +
					((vote.answer.length > 60) ? vote.answer.slice(0, 60) + '...' : vote.answer) + '\n';
				});
			};
			content = 
			'```ansi\n' + 
			`против ${results.no} [[0;41m${' '.repeat(Math.round((results.no/results.result.length)*20))}[0;45m${' '.repeat(Math.round((results.yes/results.result.length)*20))}[0m] ${results.yes} за\n` + votes +
			'```';
		};
		return content;
	},
};
