import { NestFactory } from '@nestjs/core';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';
import { LoggerService } from './logger/logger.service';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from './config/app.config';
import { DBConfig } from './config/db.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new LoggerService('service', 'api');

  // Получаем конфигурацию
  const configService = app.get(ConfigService);
  const appConfig = configService.getOrThrow<AppConfig>('app');

  // Логируем env только если режим разработки
  if (process.env.NODE_ENV === 'development') {
    const configs = {
      app: configService.getOrThrow<AppConfig>('app'),
      db: configService.getOrThrow<DBConfig>('db'),
    };
    logger.info(`Environment variables: ${JSON.stringify(configs, null, 2)}`);
  }

  // Устанавливаем глобальный префикс ДО создания Swagger-документа
  app.setGlobalPrefix('api', {
    exclude: ['/bull-board', '/bull-board/(.*)'], // исключаем Bull Board
  });

  // Ограничение размера тела запроса
  const bodyLimit = `${appConfig.bodyLimit}mb`;
  app.use(json({ limit: bodyLimit }));
  app.use(urlencoded({ extended: true, limit: bodyLimit }));

  // Запуск сервера
  await app.listen(appConfig.port, () =>
    logger.info(`Server started on port = ${appConfig.port}`),
  );
}

bootstrap().catch(() => {
  process.exit(1);
});
