const {Model, DataTypes} = require('sequelize');

// item_value intentionally does not have a foreign key to monitored_host_item to prevent table scans when deleting a host or monitored_host_item
// table will be refactored to include organization_id as partitioned table to drop table when deleting organization and to prevent excessive table scans
// when deleting item_value for a host
class ItemValue extends Model {
	static initialized = false;
	organizationId;
	hostItemId;
	value;
	timestamp;

	static initialize(sequelize) {
		if (ItemValue.initialized) {
			return;
		}
		ItemValue.initialized = true;

		ItemValue.init(
			{
				organizationId: {
					type: DataTypes.INTEGER,
					allowNull: false
				},
				hostItemId: {
					type: DataTypes.INTEGER,
					allowNull: false
				},
				value: {
					type: DataTypes.DOUBLE,
					allowNull: true
				},
				timestamp: {
					type: DataTypes.DATE(6),
					allowNull: true
				}
			},
			{
				tableName: 'item_value',
				timestamps: false,
				underscored: true,
				sequelize,
				indexes: [{
					fields: ['organization_id', 'host_item_id', 'timestamp'],
					name: 'iv_oht_idx',
					unique: true,
					using: 'btree'
				}]
			}
		);

		ItemValue.removeAttribute('id');
	}
}

exports.ItemValue = ItemValue;