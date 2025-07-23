import { Module } from '@nestjs/common';
import { LoggerModule } from './logger/logger.module';
import { ConfigModule } from '@nestjs/config';
import configs from './config';
import { configValidationSchema } from './config/configValidateSchema';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: configs,
      validationSchema: configValidationSchema,
      validationOptions: {
        allowUnknown: true, // Разрешает дополнительные переменные (не из схемы)
        abortEarly: false, // Не останавливаться при первой ошибке
      },
      isGlobal: true,
    }),
    LoggerModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
