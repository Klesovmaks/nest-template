// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config({ path: '.env' });
module.exports = {
  production: {
    username: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DB,
    host: process.env.PG_HOST,
    dialect: 'postgres',
    debug: false,
    dialectOptions: {
      decimalNumbers: true,
    },
    define: {
      freezeTableName: true,
    },
    seederStorage: 'sequelize',
    seederStorageTableName: 'SequelizeMeta',
  },
  development: {
    username: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DB,
    host: process.env.PG_HOST,
    dialect: 'postgres',
    dialectOptions: {
      decimalNumbers: true,
    },
    define: {
      freezeTableName: true,
    },
    seederStorage: 'sequelize',
    seederStorageTableName: 'SequelizeMeta',
  },
};
