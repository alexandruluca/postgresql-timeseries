const {Entity} = require('./Entity');

const entity = new Entity({
    database: 'test',
    password: '123123',
    username: 'root',
    host: '127.0.0.1',
    port: 5432,
    logging: console.log
});

(async () => {
    await entity.sync();

    console.log('fin');

})().catch(console.error);