const { DataTypes, Model } = require('sequelize');

/**
 * @property {string} id ID роли
 * @property {number} mode Мод(?) TODO: WTF?! Что это такое?
 * @property {string} last_channel_id ID последнего канала юзера
 * @property {string} voice_data Данные войс-канала
 */
class User extends Model {}

User.init({

	id: {
		type: DataTypes.STRING(50),
		primaryKey: true,
		allowNull: false,
		defaultValue: ''
	},

	mode: {
		type: DataTypes.TINYINT,
		allowNull: true,
		defaultValue: 0
	},

	last_channel_id: {
		type: DataTypes.STRING(50),
		allowNull: true
	},

	voice_data: {
		type: DataTypes.TEXT,
		allowNull: true
	}

}, {
	sequelize,
	tableName: 'users'
});

module.exports = User;