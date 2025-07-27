import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch() // Декоратор говорит, что фильтр ловит все исключения (любой тип)
export class AllExceptionsFilter implements ExceptionFilter {
  // Встроенный логгер NestJS с контекстом имени фильтра
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    // Получаем HTTP контекст (request/response) из общего контекста
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    // Проверяем, является ли исключение HttpException (обработано NestJS)
    const isHttpException = exception instanceof HttpException;

    // Получаем HTTP статус из исключения, либо 500 (Internal Server Error) по умолчанию
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    // Получаем из исключения тело с деталями (строка или объект) или null
    const errorResponse = isHttpException ? exception.getResponse() : null;

    // Инициализируем дефолтные значения сообщения и ошибки
    let error = 'Внутренняя ошибка сервера';
    let message: string | string[] = 'Внутренняя ошибка сервера';

    // Если response из исключения — строка, используем её и как error, и как message
    if (typeof errorResponse === 'string') {
      error = errorResponse;
      message = errorResponse;

      // Если это объект и не null, пытаемся извлечь поля error и message
    } else if (typeof errorResponse === 'object' && errorResponse !== null) {
      // error — краткое описание ошибки (например, Bad Request)
      error = (errorResponse as any).error ?? status.toString();
      // message — подробное описание или список ошибок (часто бывает строкой или массивом)
      message = (errorResponse as any).message ?? error;

      // Если это не HttpException, но это объект Error — берём из него сообщение
    } else if (!isHttpException) {
      if (exception instanceof Error && exception.message) {
        error = exception.message;
        message = exception.message;
      }
    }

    // Формируем единый ответ клиенту с полями statusCode, error и message
    const responseBody = {
      statusCode: status,
      error,
      message,
    };

    // Формируем строку с деталями запроса для логов: HTTP метод и URL
    const reqDetails = `[${request.method}] ${request.url}`;

    // Логируем ошибку с указанием детали запроса, краткого описания ошибки и полного stack trace (если есть)
    this.logger.error(
      `${reqDetails} - ${error} - message: ${JSON.stringify(message)}`,
      exception instanceof Error ? exception.stack : '',
    );

    // Отправляем клиенту сформированный JSON с кодом ответа
    response.status(status).json(responseBody);
  }
}
