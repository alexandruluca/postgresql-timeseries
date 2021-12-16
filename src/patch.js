const PostgresQueryGenerator = require('sequelize/lib/dialects/postgres/query-generator');
const {PostgresQueryInterface} = require('sequelize/lib/dialects/postgres/query-interface');
const {Sequelize} = require('sequelize');

const sequelizeQuery = Sequelize.prototype.query;

Sequelize.prototype.query = async function () {
    let args = arguments;

    return queryWithRetry(() => {
        return sequelizeQuery.apply(this, args);
    });
};

const originalCreateTableQuery = PostgresQueryGenerator.prototype.createTableQuery;
const originalAddIndex = PostgresQueryInterface.prototype.addIndex;

PostgresQueryGenerator.prototype.createTableQuery = function (tableName, attributes, options) {
    let query = originalCreateTableQuery.apply(this, arguments);

    if (tableName === 'item_value') {
        query = query.slice(0, -1);
        query += ` partition by list("organization_id");`;
    }

    return query;
}

PostgresQueryInterface.prototype.addIndex = async function (tableName, attributes, options, rawTablename) {
    try {
        let res = await originalAddIndex.apply(this, arguments);
        return res;
    } catch (err) {
        let indexName = attributes.name;
        let message = (err.original || err).message;
        if (message === `relation "${indexName}" already exists`) {
            return;
        }
        throw err;
    }
}

/**
 * When querying on the replication server, we get sometimes 'terminating connection due to conflict with recovery' or
 * 'canceling statement due to conflict with recovery', due to vacuum being performed
 * We do an exponentation back-off, with a max of 5 attemtps. This means last wait time will be 3200 ms, and the total query time will max 6200 ms
 * @param {Function} fn
 * @param {String} depth
 */
async function queryWithRetry(fn, depth = 1) {
    try {
        return await fn();
    } catch (err) {
        // retry operation on read replica, only one time

        let isReplicaError = err.original && [
            'terminating connection due to conflict with recovery',
            'canceling statement due to conflict with recovery'
        ].includes(err.original.message);

        if (!isReplicaError || depth > 5) {
            throw err;
        }
        let waitMs = 2 ** depth * 100;
        console.info(`${err.original.message}, will retry operation in: ${waitMs} ms`);
        await wait(waitMs);

        return queryWithRetry(fn, depth + 1);
    }
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));