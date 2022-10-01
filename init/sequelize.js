const { Sequelize } = require('sequelize');

module.exports = async function () {

	global.sequelize = new Sequelize({
		host: process.env.CLEARDB_HOST,
		username: process.env.CLEARDB_USER,
		password: process.env.CLEARDB_PASSWORD,
		database: process.env.CLEARDB_DATABASE,
		dialect: 'mysql',
		logging: false
	});

};