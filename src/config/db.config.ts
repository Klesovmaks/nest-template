import { registerAs } from '@nestjs/config';

export interface DBConfig {
  readonly dialect: string;
  readonly host: string;
  readonly port: number;
  readonly username: string;
  readonly password: string;
  readonly database: string;
  readonly autoLoadModels: boolean;
  readonly synchronize: boolean;
}

export default registerAs('db', () => ({
  dialect: 'postgres',
  host: process.env.PG_HOST,
  port: Number(process.env.PG_PORT),
  username: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DB,
  autoLoadModels: true,
  synchronize: true,
}));
