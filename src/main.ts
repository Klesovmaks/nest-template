import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggerService } from './logger/logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new LoggerService('service', 'api');

  // Запуск сервера
  const port = 9999;
  await app.listen(port, () => logger.info(`Server started on port = ${port}`));
}
bootstrap();
