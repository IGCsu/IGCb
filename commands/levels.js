const fetch = require('node-fetch');

module.exports = {

	active : true,
	category : 'Голосовые каналы',

	name : 'levels',
	title : 'Levels',
	description : 'Мониторит сообщения пользователей для начисления опыта. При достижении определённых уровней, пользователи получают роли за активность',
	descriptionShort : 'Роли за активность',

	noXPChannels : [
		'610371610620198922', // рандом
		'574997373219110922', // logs
		'572472723624951839', // ивенты
		'520289167889137665', // ссылки
		'500013665538539523', // видео-с-канала

		'761593401291571240', // Буфер
		'500300747053989888', // Информационный
		'562559696146530314', // Голосовые
		'776918362482671616', // Удалённые каналы
	],

	usersDB : {},

	slashOptions : [{
		name : 'user',
		name_localizations : {'ru': 'пользователь' , 'uk': 'користувач'},
		description : 'Whose statistics to show. Yours by default.',
		description_localizations : {'ru': 'Чью статистику показать. По усолчанию вашу', 'uk': 'Чию статистику показувати. Ваш за замовчуванням.'},
		type : 6,
		required : false
	}],

	scan : async function(channel){

		log.start('Начало обработки #' + channel.name);

		let count = 0;
		let messages = {};
		let last = undefined;
		let lastTime = undefined;

		const timeStart = process.hrtime();

		while(true){
			let m;
			try{
				m = await channel.messages.fetch({ limit : 100, before : last });
			}catch(e){
				continue;
			}

			last = m.lastKey();
			m.forEach((item, i) => {
				messages[i] = item;
				lastTime = item.createdTimestamp;
			});

			count += m.size;

			process.stdout.write('\r' + count);

			if(m.size < 100) break;
			if(lastTime < 1649462400000) break;
		}

		process.stdout.write('\n');

		const timeEnd = process.hrtime(timeStart);
		const timePerf = (timeEnd[0]*1000) + (timeEnd[1] / 1000000);

		log.start('Сообщений собрано: ' + count + ' за ' + timePerf + 'ms');

		let users = {};
		for(const m in messages){
			const msg = messages[m];

			if(msg.author.bot) continue;
			if(this.usersDB[msg.author.id] === undefined) continue;
			if(!this.usersDB[msg.author.id] > msg.createdTimestamp) continue;

			this.usersDB[msg.author.id] = msg.createdTimestamp;
			users[msg.author.id] = msg.createdTimestamp;
		}

		// for(const m in messages){
		// 	const msg = messages[m];
		//
		// 	if(msg.author.bot) continue;
		// 	if(!users[msg.author.id]) users[msg.author.id] = { messagesOld : 0, messagesAll : 0, symbols : 0 };
		//
		// 	users[msg.author.id][msg.createdTimestamp > 1533223080000 ? 'messagesAll' : 'messagesOld'] += 1;
		// 	users[msg.author.id].symbols += msg.content.length;
		// }

		let userI = 0;
		const usersLength = Object.keys(users).length;
		for(const u in users){
			++userI;
			log.warn(userI + '/' + usersLength + ' = ' + (userI/usersLength*100).toFixed(2) + '% ID:' + u + ' last:' + users[u]);
			const sql = 'UPDATE levels SET last = ' + users[u] + ' WHERE id = ' + u
			try{
				DB.query(sql);
			}catch(e){
				log.error(sql);
			}
		}

		// let userI = 0;
		// const usersLength = Object.keys(users).length;
		// for(const u in users){
		// 	++userI;
		// 	log.warn(userI + '/' + usersLength + ' = ' + (userI/usersLength*100).toFixed(2) + '% ID:' + u + ' messagesOld:' + users[u].messagesOld + ' messagesAll:' + users[u].messagesAll + ' symbols:' + users[u].symbols);
		// 	const sql = this.usersDB[u]
		// 		? 'UPDATE levels SET messagesOld = messagesOld + ' + users[u].messagesOld + ', messagesAll = messagesAll + ' + users[u].messagesAll + ', symbols = symbols + ' + users[u].symbols + ' WHERE id = ' + u
		// 		: 'INSERT INTO levels (`messagesOld`, `messagesAll`, `symbols`, `id`) VALUES (' + users[u].messagesOld + ', ' + users[u].messagesAll + ', ' + users[u].symbols + ', ' + u + ')'
		// 	try{
		// 		DB.query(sql);
		// 		this.usersDB[u] = true;
		// 	}catch(e){
		// 		log.error(sql);
		// 	}
		// }

		guild.channels.cache.get('574997373219110922').send({
			content : 'Завершено сканирование \'' + channel.id + '\', // #' + channel.name + ': Сообщений собрано: ' + count + ' за ' + timePerf + 'ms, пользователей: ' + usersLength
		});
		this.noXPChannels.push(channel.id);

	},

	init : async function(path){

		this.roles = DB.query('SELECT * FROM levels_roles');
		this.roles.sort((a, b) => b.value - a.value);
		this.rolesIDs = [];
		for(const role of this.roles)
			if(role.id != '648762974277992448') this.rolesIDs.push(role.id);

		const users = DB.query('SELECT * FROM levels');
		for(const user of users) this.usersDB[user.id] = user.last;
		// for(const user of users) this.usersDB[user.id] = true;
		//
		// const response = await fetch('https://mee6.xyz/api/plugins/levels/leaderboard/433242520034738186?limit=1000&page=3');
		// const json = JSON.parse(await response.text());
		//
		// for(const user of json.players){
		// 	const sql = this.usersDB[user.id]
		// 		? 'UPDATE levels SET messagesLegit = ' + user.message_count + ', expOld = ' + user.xp + ' WHERE id = ' + user.id
		// 		: 'INSERT INTO levels (`messagesLegit`, `expOld`, `id`) VALUES (' + user.message_count + ', ' + user.xp + ', ' + user.id + ')'
		// 	// try{
		// 		DB.query(sql);
		// 		log.warn(sql);
		// 		this.usersDB[user.id] = true;
		// 	// }catch(e){
		// 	// 	log.error(sql);
		// 	// }
		// }

		const channels = (await guild.channels.fetch()).values();
		for(const c of channels){
			if(c.type == 'GUILD_VOICE' || c.type == 'GUILD_CATEGORY') continue;
			if(this.noXPChannels.includes(c.parentId)) continue;
			if(this.noXPChannels.includes(c.id)) continue;
			// console.log(c.name);
			await this.scan(c);
		};

		return this;

	},

	call : async function(msg){
		// return;
		if(msg.author.id == '256114365894230018') return;
		// if(msg.author.id != '500020124515041283') return;
		if(msg.author.bot) return;
		if(this.noXPChannels.includes(msg.channel.parentId)) return;
		if(this.noXPChannels.includes(msg.channelId)) return;

		const currentTime = Math.floor(Date.now() / 1000);
		const user = this.getFirst('SELECT * FROM levels WHERE id = ?', [msg.author.id]);
		if(!user){
			DB.query('INSERT INTO levels (`id`) VALUES (?)', [msg.author.id]);
			user = { id : msg.author.id, last : 0, messagesAll : 0, messagesLegit : 0, symbols : 0, passivity : 0 };
		}

		user.messagesAll += 1;
		user.symbols += msg.content.length;
		if(user.last + 60 <= currentTime){
			user.last == currentTime;
			user.messagesLegit += 1;
			DB.query('UPDATE levels SET messagesAll = messagesAll + 1, messagesLegit = messagesLegit + 1, symbols = symbols + ?, last = ? WHERE id = ?', [
				msg.content.length, currentTime, msg.author.id
			]);
		}else{
			DB.query('UPDATE levels SET messagesAll = messagesAll + 1, symbols = symbols + ? WHERE id = ?', [
				msg.content.length, msg.author.id
			]);
		}

		const symbolsAvg = Math.round((user.symbols/user.messagesAll)*10)/10;
		const exp = Math.round(user.messagesLegit * symbolsAvg);
		const role = this.getRole(exp);

		if(role.id == '648762974277992448') return;
		if(msg.member.roles.cache.has(role.id)) return;

		// try{
			msg.member.roles.cache.filter(r => this.rolesIDs.includes(r.id)).each(r => {
				if(r.id != role.id) msg.member.roles.remove(r, 'По причине изменения уровня');
			});
			msg.member.roles.add(guild.roles.cache.get(role.id), 'По причине изменения уровня');
		// }catch(e){
		//
		// }
	},

	getFirst : (sql, values) => DB.query(sql, values)[0] ?? undefined,

	getRole : function(exp){
		for(const role of this.roles)
			if(role.value <= exp) return role;
	},

	slash: async function(int){
		const target = int.options.getUser('user') ?? int.user;
		const content = getContent(int, target);
		await int.reply({ embeds: content.embeds, components: content.component });
	},

	contextUser: async function(int){
		const content = getContent(int, int.targetUser);
		await int.reply({ embeds: content.embeds, components: content.component, ephemeral: true });
	},

	getContent: function(int, target){
		return {
			embeds: [new Discord.MessageEmbed().setTitle(localize(int.locale, 'In development'))], 
			components: [{type:1, components: [
				{
					type: 2, style:5, url: 'https://igc.su/levels', label: 'Таблица'
				},
				{
					type: 2, style:5, url: 'https://igc.su/levels?id=' + target.id, label: 'Статистика пользователя'
				}
			]}],
		}
	},

};
