const {Model, DataTypes} = require('sequelize');
const {CustomDataTypes} = require('./types/Custom');

class Organization extends Model {
	static initialized = false;
	id;
	name;

	static initialize(sequelize) {
		if (Organization.initialized) {
			return;
		}
		Organization.initialized = true;

		Organization.init({
			id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true,
			},
			name: {
				type: DataTypes.STRING(255),
				allowNull: false
			},
		}, {
			tableName: 'organizations',
			timestamps: true,
			underscored: true,
			sequelize
		});

		Organization.initAssociations(sequelize);
	}

	static initAssociations(sequelize) {
		/*  Organization.hasMany(Host, {
			 foreignKey: 'organizationId',
			 onDelete: 'cascade'
		 }); */
	}
}

exports.Organization = Organization;