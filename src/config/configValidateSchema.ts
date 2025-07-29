import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  APP_PORT: Joi.number().default(9998),
  API_KEY: Joi.string()
    .guid({
      version: ['uuidv4'],
    })
    .required(),
  API_BODY_LIMIT: Joi.string().required(),
  LOG_FILE_MAX_SIZE: Joi.number().required(),
  LOG_FILE_MAX_RETENTION_DAYS: Joi.number().required(),
  PG_HOST: Joi.string().required(),
  PG_PORT: Joi.number().required(),
  PG_USER: Joi.string().required(),
  PG_PASSWORD: Joi.string().required(),
  PG_DB: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  JWT_ACCESS_TOKEN_EXPIRES: Joi.number().required(),
  JWT_REFRESH_TOKEN_EXPIRES: Joi.number().required(),
});
