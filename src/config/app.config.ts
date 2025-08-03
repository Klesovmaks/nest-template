import { registerAs } from '@nestjs/config';

export interface AppConfig {
  readonly port: number;
  readonly key: string;
  readonly bodyLimit: string;
  readonly log: {
    readonly maxSize: string;
    readonly maxRetentionDays: string;
  };
}

export default registerAs('app', () => ({
  port: process.env.APP_PORT ?? 9998,
  key: process.env.API_KEY,
  bodyLimit: process.env.API_BODY_LIMIT,
  log: {
    maxSize: process.env.LOG_FILE_MAX_SIZE,
    maxRetentionDays: process.env.LOG_FILE_MAX_RETENTION_DAYS,
  },
}));
