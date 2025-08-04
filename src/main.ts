import { NestFactory } from '@nestjs/core';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';
import { LoggerService } from './logger/logger.service';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from './config/app.config';
import { DBConfig } from './config/db.config';
import { JWTConfig } from './config/jwt.config';
import {
  BadRequestException,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  // Создаем NestJS приложение на основе корневого модуля
  const app = await NestFactory.create(AppModule);

  // Получаем сервис конфигурации NestJS
  const configService = app.get(ConfigService);

  // Инициализируем пользовательский логгер (можно заменить на глобальный, если требуется)
  const logger = new LoggerService('service', 'api', configService);

  // Извлекаем конфигурацию приложения с гарантией наличия (getOrThrow выбросит ошибку, если конфиг не найден)
  const appConfig = configService.getOrThrow<AppConfig>('app');

  // Логируем текущие конфигурации только в режиме разработки
  if (process.env.NODE_ENV === 'development') {
    // Для наглядности собираем несколько конфигов в один объект
    const configs = {
      app: appConfig,
      db: configService.getOrThrow<DBConfig>('db'),
      jwt: configService.getOrThrow<JWTConfig>('jwt'),
    };
    // Красивый вывод с отступами для удобства чтения
    logger.info(`Environment variables: ${JSON.stringify(configs, null, 2)}`);
  }

  // Устанавливаем глобальный префикс для всех маршрутов API
  app.setGlobalPrefix('api', {
    // Исключаем маршруты Bull Board из префикса, чтобы они работали напрямую
    exclude: ['/bull-board', '/bull-board/*path'],
  });

  // Глобальные фильтры, пайпы и интерсепторы
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors: ValidationError[]) => {
        const messages = errors
          .map((err) =>
            err.constraints ? Object.values(err.constraints).join(', ') : '',
          )
          .filter((msg) => msg !== '')
          .join('; ');
        return new BadRequestException(messages);
      },
    }),
  );
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Устанавливаем ограничение размера тела запроса, берем из конфигурации и добавляем единицу измерения 'mb'
  const bodyLimit = `${appConfig.bodyLimit}mb`;

  // Настраиваем парсеры тела запросов Express с нужным лимитом
  app.use(json({ limit: bodyLimit }));
  app.use(urlencoded({ extended: true, limit: bodyLimit }));

  // Включаем отслеживание системных сигналов для graceful shutdown
  app.enableShutdownHooks();

  // Запуск HTTP сервера на порту из конфигурации
  await app.listen(appConfig.port, () =>
    logger.info(`Server started on port = ${appConfig.port}`),
  );
}

// Запуск основной функции bootstrap
// В случае ошибки выход из процесса с кодом 1
bootstrap().catch(() => {
  process.exit(1);
});
