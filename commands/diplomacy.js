const fetch = require('node-fetch');

module.exports = {

	active : true,
	category : 'Голосовые каналы',

	name : 'diplomacy',
	title : 'Diplomacy',
	description : 'Уведомления игры Diplomacy',
	descriptionShort : 'Уведомления игры Diplomacy',

	gameID : '51872',
	interval : 600,

	players : {
		'19271' : '378478050460827648',
		'19287' : '294713715599736834',
		'19671' : '267312791751229449',
		'19654' : '586191681519484930',
		'19661' : '533245137216864286',
		'19663' : '917452598108377159',
		'19688' : '247374977890779137',
		'19669' : '256112905919922177',
		'19659' : '590444955709997056',
		'19673' : '312282430880874503',
		'19290' : '391550905234882561',
		'19666' : '476805321046884352',
		'19658' : '667377111589191681',
		'19668' : '381489366406791169',
		'19291' : '443686702414954496',
		'19670' : '417025997570048002',
		'19667' : '475011645912121364',
		'19697' : '262987240488042496',
		'19672' : '385450870638247958',
		'19655' : '256114365894230018'
	},

	flags : {
		'France' : '🇫🇷',
		'Italy' : '🇮🇹',
		'Turkey' : '🇹🇷',
		'Lithuania' : '🇱🇹',
		'Germany' : '🇩🇪',
		'United Kingdom' : '🇬🇧',
		'Spain' : '🇪🇸',
		'Greece' : '🇬🇷',
		'Ukraine' : '🇺🇦',
		'Netherlands' : '🇳🇱',
		'Poland' : '🇵🇱',
		'Sweden' : '🇸🇪',
		'Finland' : '🇫🇮',
		'Romania' : '🇷🇴',
		'Serbia' : '🇷🇸',
		'Georgia' : '🇬🇪',
		'Czechia' : '🇨🇿',
		'Ireland' : '🇮🇪',
		'Portugal' : '🇵🇹',
		'Russia' : '🇷🇺',
	},

	statuses : {
		'Ready' : 'success',
		'Completed' : 'warning',
		'Not received' : 'error'
	},

	init : async function(path){

		const response = await fetch('https://www.vdiplomacy.com/board.php?gameID=' + this.gameID);
		const body = await response.text();

		if(body.includes('Game not found')){
			log.error(path + ': Игра ID:' + this.gameID + ' не найдена');
			this.active = false;
			return this;
		}

		this.channel = guild.channels.cache.get('898257036926660698');

		this.timerId = setInterval(async () => {
			try{
				const result = await this.update(false);
				if(result.status) await this.channel.send(result.data);
			}catch(e){
				log.error(path + ': ' + e.message);
				clearInterval(this.timerId);
			}
		}, this.interval * 1000);

		const pattern = '<tr class="member memberAlternate\\d"><td class="memberLeftSide">\\s+<span class="memberCountryName"> <span class="member\\d+StatusIcon"><img src=".+" alt="(.+)" title=".+" \\/> <\\/span><span class="country\\d+  memberStatusPlaying">(.+)<\\/span><\\/span>\\s+<\\/td>\\s+<td class="memberRightSide ">\\s+<div>\\s+<div class="memberUserDetail">\\s+<span class="memberName"><a href=profile\\.php\\?userID=(\\d+)">.+<\\/a>\\s+<span class="points">\\(1000 <img src="images\\/icons\\/vpoints\\.png" alt="D" title="vDiplomacy points" \\/><\\/b>\\)<\\/span><\\/span>  - Delays left: <span class="excusedNMRs">(\\d+)<\\/span> of <span class="excusedNMRs">(\\d+)<\\/span><\\/span>\\s+<\\/div>\\s+<div class="memberGameDetail">\\s+<span class="memberPointsCount"><\\/span><br \\/><span class="memberUnitCount"><span class="memberSCCount"><em>(\\d+)<\\/em> supply-centers, <em class=".+">(\\d+)<\\/em> units<\\/span><\\/span>';

		this.globalRegExp = new RegExp(pattern, 'g');
		this.localRegExp = new RegExp(pattern);

		return this;

	},

	/**
	 * Обработка слеш-команды
	 * @param {CommandInteraction} int Команда пользователя
	 */
	slash : async function(int){
		try{
			const result = await this.update(true);
			result.status
				? int.reply(result.data)
				: int.reply({ content : reaction.emoji.error + ' ' + result.data, ephemeral : true });
		}catch(e){
			int.reply({ content : reaction.emoji.error + ' [500] Ошибка!', ephemeral : true });
			log.error(path + ': ' + e.message);
			clearInterval(this.timerId);
		}
	},



	update : async function(status){
		const response = await fetch('https://www.vdiplomacy.com/board.php?gameID=' + this.gameID);
		const body = await response.text();

		const currentHour = new Date().getHours();
		const currentTime = Math.floor(Date.now() / 1000);
		const turnDeadline = body.match(/<span class="timestampGames" unixtime="([0-9]+)">/)[1];
		const phaseLength = this.convertTimeToSeconds(body.match(/<span class="gameHoursPerPhase"><strong>([0-9\sa-z]+)<\/strong>/i)[1]);

		if(currentTime + phaseLength - this.interval < turnDeadline && this.interval < phaseLength)
			status = 'turn';

		if(!status) return { status : false, data : 'Нет новостей' };

		if(status !== 'turn' && this.lastUpdate !== undefined && this.lastUpdate + 2 >= currentHour)
			status = 'nopings';

		const users = body.match(this.globalRegExp);
		if(!users) return { status : false, data : 'Ошибка!' };

		let text = '';
		let ping = '';
		for(user of users){
			const data = user.match(this.localRegExp);
			text += '\n' + reaction.emoji[this.statuses[data[1]]] + '  ' + this.flags[data[2]] + '<@' + this.players[data[3]] + '> ' + data[6] + ' supply, ' + data[7] + ' units';
			if(data[1] == 'Not received') ping += '<@' + this.players[data[3]] + '>';
		}

		const turn = body.match(/src="map\.php\?gameID=\d+&turn=(\d+)&mapType=large"/)[1];
		const info = body.match(/<div class="titleBarLeftSide"><div><i><a class="light" href=".+">.+<\/a><\/i> - <span class="gameDate">(.+)<\/span>, <span class="gamePhase">(.+)<\/span>/);

		let embed = new Discord.MessageEmbed()
			.setTimestamp()
			.setAuthor({ name : 'www.vdiplomacy.com', url : 'https://www.vdiplomacy.com/board.php?gameID=' + this.gameID })
			.setDescription('Конец хода <t:' + turnDeadline + ':R>\n' + text)
			.setFooter({ text : info[1] + ', ' + info[2] })
			.setImage('https://www.vdiplomacy.com/map.php?gameID=' + this.gameID + '&turn=' + turn + '&mapType=large');

		if(status == 'turn')
			embed.setTitle(reaction.emoji.success + ' Мут выдан на ' + time);

		this.lastUpdate = currentHour;

		let data = { embeds : [embed] };
		if(status != 'nopings' && ping.length) data.content = '||' + ping + '||';

		return { status : true, data : data };
	},



	convertTimeToSeconds : str => {
		switch(str){
			case '5 minutes': return 300;
			case '7 minutes': return 420;
			case '10 minutes': return 600;
			case '15 minutes': return 900;
			case '20 minutes': return 1200;
			case '30 minutes': return 1800;
			case '1 hours': return 3600;
			case '2 hours': return 7200;
			case '4 hours': return 14400;
			case '6 hours': return 21600;
			case '8 hours': return 28800;
			case '10 hours': return 36000;
			case '12 hours': return 43200;
			case '14 hours': return 50400;
			case '16 hours': return 57600;
			case '18 hours': return 64800;
			case '20 hours': return 72000;
			case '22 hours': return 79200;
			case '1 day': return 86400;
			case '1 day, 1 hours': return 90000;
			case '1 day, 12 hours': return 115200;
			case '2 days': return 172800;
			case '2 days, 2 hours': return 180000;
			case '3 days': return 259200;
			case '4 days': return 345600;
			case '5 days': return 432000;
			case '6 days': return 518400;
			case '7 days': return 604800;
			case '10 days': return 864000;
		}
	}

};
