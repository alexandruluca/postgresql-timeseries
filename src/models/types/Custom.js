const {Sequelize} = require('sequelize');

const CustomDataTypes = {
	UUIDV4: Sequelize.literal('uuid_generate_v4()'),
	VARCHAR: 'VARCHAR'
}

exports.CustomDataTypes = CustomDataTypes;