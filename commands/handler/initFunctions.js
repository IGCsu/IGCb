const fs = require('fs');
const dir = './commands/handler/func/';

module.exports = async indexPath => {

	let list = {};

	fs.readdirSync(dir).forEach(channel => {
		const channelDir = dir + channel + '/';
		list[channel] = {};

		fs.readdirSync(channelDir).forEach(file => {

			const timeStart = process.hrtime();

			const name = file.split('.')[0];
			const func = require('./func/' + channel + '/' + file);

			if(typeof func == 'function') list[channel][name] = func;

			const timeEnd = process.hrtime(timeStart);
			const pref = (timeEnd[0]*1000) + (timeEnd[1] / 1000000);

			log.initText += log.load(channelDir + file, pref, typeof func == 'function');

		});

	});

	return list;

};
