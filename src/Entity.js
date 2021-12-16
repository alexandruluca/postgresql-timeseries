const {Sequelize} = require('sequelize');

require('./patch');

let optionDefaults = {
    dialect: 'postgres',
    dialectOptions: {
        dateStrings: true,
        maxPreparedStatements: 100,
        decimalNumbers: true
    },
    pool: {
        min: 5,
        max: 10,
        idle: 60000
    },
    define: {
        charset: 'utf8',
        collate: 'utf8_general_ci'
    },
    timezone: '+00:00'
};
class Entity extends Sequelize {
    constructor(options) {
        options = Object.assign({}, optionDefaults, options);
        super(
            options.database,
            options.username,
            options.password,
            options
        );
    }

    async setup() {
        await this.initExtensions();
    }

    /**
     * Creates an item_value partition for each organization
     * @param {String} orgId
     */
    async createItemValuePartition(orgId) {
        let normalizedId = orgId.replace(/-/g, '');
        let tableName = `item_value_${normalizedId}`;

        let query = `
				CREATE TABLE IF NOT EXISTS
				${tableName} PARTITION OF
				item_value FOR VALUES IN (:orgId) PARTITION BY RANGE(timestamp);
				`;

        await this.query(query, {
            replacements: {
                tableName,
                orgId
            },
            useMaster: true
        });

        await this.query(`SELECT create_parent('public.${tableName}','timestamp','native','weekly')`, {
            useMaster: true
        });
        await this.query(`UPDATE part_config SET retention_keep_table = false, retention = '2 month' WHERE parent_table = 'public.${tableName}'`, {
            useMaster: true
        });
    }

    /**
     * Drop item_value organization partition and partition related configuration
     * @param {String} orgId
     */
    async dropItemValuePartition(orgId) {
        let normalizedId = orgId.replace(/-/g, '');
        let tableName = `item_value_${normalizedId}`;

        let dropTable = this.query(`DROP TABLE IF EXISTS ${tableName}`, {
            useMaster: true
        });// drop partition for org
        let dropPartitionConfig = this.query(`DELETE FROM part_config WHERE parent_table = :tableName;`, {
            replacements: {
                tableName: `public.${tableName}`
            },
            useMaster: true
        });// drop partition related config

        await Promise.all([
            dropTable,
            dropPartitionConfig
        ]);
    }

    async sync(options) {
        await this.initModels();
        await this.setup();

        return super.sync(options);
    }

    initModels() {
        require('./models/Organization').Organization.initialize(this);
        require('./models/ItemValue').ItemValue.initialize(this);
    }

    initExtensions() {
        return Promise.all([
            this.query('CREATE EXTENSION IF NOT EXISTS "citext";', {useMaster: true}),
            this.query('CREATE EXTENSION IF NOT EXISTS pg_partman WITH SCHEMA public;', {useMaster: true})
        ]);
    }
}

exports.Entity = Entity;