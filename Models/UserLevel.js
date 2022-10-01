const { DataTypes, Model } = require('sequelize');

/**
 * @property {string} id ID пользователя
 * @property {number} messagesAll Кол-во всех сообщений
 * @property {number} messagesLegit Кол-во засчитанных сообщений
 * @property {number} messagesOld Кол-во старых сообщений
 * @property {number} symbols Кол-во символов
 * @property {number} expOld Устаревший опыт
 * @property {number} activity Активность
 * @property {number} last Timestamp последнего сообщения
 */
class UserLevel extends Model {}

UserLevel.init({

	id: {
		type: DataTypes.STRING(50),
		primaryKey: true,
		allowNull: false,
		defaultValue: ''
	},

	messagesAll: {
		type: DataTypes.INTEGER,
		allowNull: false,
		defaultValue: 0
	},

	messagesLegit: {
		type: DataTypes.INTEGER,
		allowNull: false,
		defaultValue: 0
	},

	messagesOld: {
		type: DataTypes.INTEGER,
		allowNull: false,
		defaultValue: 0
	},

	symbols: {
		type: DataTypes.INTEGER,
		allowNull: false,
		defaultValue: 0
	},

	expOld: {
		type: DataTypes.INTEGER,
		allowNull: false,
		defaultValue: 0
	},

	activity: {
		type: DataTypes.INTEGER,
		allowNull: false,
		defaultValue: 0
	},

	last: {
		type: DataTypes.INTEGER,
		allowNull: false,
		defaultValue: 0
	}

}, {
	sequelize,
	tableName: 'levels'
});

module.exports = UserLevel;