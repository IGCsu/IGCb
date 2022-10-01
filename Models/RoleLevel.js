const { DataTypes, Model } = require('sequelize');

/**
 * @property {string} id ID роли
 * @property {number} value Кол-во необходимого опыта
 */
class RoleLevel extends Model {}

RoleLevel.init({

	id: {
		type: DataTypes.STRING(50),
		primaryKey: true,
		allowNull: false
	},

	value: {
		type: DataTypes.INTEGER,
		allowNull: false,
		defaultValue: 0
	}

}, {
	sequelize,
	tableName: 'levels_roles'
});

module.exports = RoleLevel;