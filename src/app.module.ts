import { Module } from '@nestjs/common';
import { LoggerModule } from './logger/logger.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configs from './config';
import { configValidationSchema } from './config/configValidateSchema';
import { SequelizeModule } from '@nestjs/sequelize';
import { DBConfig } from './config/db.config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { LoggerInterceptor } from './logger/interceptors/logger.interceptor';
import { AllExceptionsFilter } from './common/filter/all-exception.filter';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    // Подключение глобального конфигурационного модуля
    ConfigModule.forRoot({
      load: configs, // Функции, возвращающие объекты конфигурации
      validationSchema: configValidationSchema, // Joi-схема для проверки env переменных
      validationOptions: {
        allowUnknown: true, // Разрешает дополнительные переменные (не из схемы)
        abortEarly: false, // Не останавливаться при первой ошибке
      },
      isGlobal: true, // Экспортируем ConfigModule глобально, чтобы не импортировать в каждом модуле
    }),
    // Создание асинхронной конфигурации модуля Sequelize
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.getOrThrow<DBConfig>('db'),
    }),
    LoggerModule,
    UserModule,
    AuthModule,
    HealthModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggerInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
