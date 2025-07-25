import { Dialect } from 'sequelize/types';
import * as dotenv from 'dotenv';

dotenv.config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

interface IConfig {
  username: string;
  password: string;
  database: string;
  host: string;
  dialect: Dialect;
  debug: boolean;
  dialectOptions: {
    decimalNumbers: boolean;
  };
  define: {
    freezeTableName: boolean;
  };
  seederStorage: string;
  seederStorageTableName: string;
}

const config: Record<string, IConfig> = {
  development: {
    username: process.env.PG_USER!,
    password: process.env.PG_PASSWORD!,
    database: process.env.PG_DB!,
    host: process.env.PG_HOST!,
    dialect: 'postgres',
    debug: true,
    dialectOptions: {
      decimalNumbers: true,
    },
    define: {
      freezeTableName: true,
    },
    seederStorage: 'sequelize',
    seederStorageTableName: 'SequelizeMeta',
  },
  production: {
    username: process.env.PG_USER!,
    password: process.env.PG_PASSWORD!,
    database: process.env.PG_DB!,
    host: process.env.PG_HOST!,
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
};

export default config;
