const { Sequelize } = require('sequelize');
const config = require('./src/config/config.js');
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    logging: false
});

async function inspect() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');

        const tableDescription = await sequelize.getQueryInterface().describeTable('product_variants');
        console.log('Schema for product_variants:');
        console.log(JSON.stringify(tableDescription, null, 2));

        const attrTableDescription = await sequelize.getQueryInterface().describeTable('product_variant_attributes');
        console.log('Schema for product_variant_attributes:');
        console.log(JSON.stringify(attrTableDescription, null, 2));

    } catch (error) {
        console.error('Unable to connect to the database:', error);
    } finally {
        await sequelize.close();
    }
}

inspect();
