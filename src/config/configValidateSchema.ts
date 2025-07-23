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
  PG_HOST: Joi.string().required(),
  PG_PORT: Joi.number().required(),
  PG_USER: Joi.string().required(),
  PG_PASSWORD: Joi.string().required(),
  PG_DB: Joi.string().required(),
});
