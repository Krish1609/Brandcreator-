const { Sequelize } = require('sequelize');
require('dotenv').config();

const dbUri = process.env.DATABASE_URL || process.env.MYSQL_URL || process.env.JAWSDB_URL || process.env.CLEARDB_DATABASE_URL;

const isRemoteHost = (host) => host && !host.includes('localhost') && !host.includes('127.0.0.1');
const enableSsl = process.env.DB_SSL === 'true' || (process.env.DB_SSL !== 'false' && (isRemoteHost(process.env.DB_HOST) || (dbUri && !dbUri.includes('localhost') && !dbUri.includes('127.0.0.1'))));

const commonOptions = {
    dialect: 'mysql',
    logging: false,
    dialectOptions: enableSsl ? {
        ssl: {
            rejectUnauthorized: false
        }
    } : {},
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
};

let sequelize;

if (dbUri) {
    sequelize = new Sequelize(dbUri, commonOptions);
} else {
    sequelize = new Sequelize(
        process.env.DB_NAME || 'brandcreator',
        process.env.DB_USER || 'root',
        process.env.DB_PASSWORD || process.env.DB_PASS || 'Krish@1609',
        {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            ...commonOptions
        }
    );
}

module.exports = sequelize;
