import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { Request, Response } from 'express';
import { LoggerFactory } from 'src/logger/logger.factory';
import { generateRandomCode } from 'src/common/utils/helpers';

/**
 * Интерцептор для логирования HTTP-запросов и ответов.
 * Логирует входящие HTTP-запросы с параметрами и тело,
 * а также исходящие HTTP-ответы с телом, кодом статуса и длительностью обработки.
 *
 * @export
 * @class LoggerInterceptor
 * @typedef {LoggerInterceptor}
 * @implements {NestInterceptor}
 */
@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  constructor(private readonly loggerFactory: LoggerFactory) {}

  /**
   * Метод перехвата запроса/ответа для логирования.
   * Генерирует уникальный id для запроса для связки логов,
   * исключает из логирования статические ресурсы bull-board,
   * замеряет время обработки запроса,
   * и маскирует содержимое тела в случае бинарных PDF.
   *
   * @param {ExecutionContext} context  - Контекст выполнения запроса NestJS.
   * @param {CallHandler} next - Следующий обработчик в цепочке.
   * @returns {Observable<any>} - Поток результата с дополнительным побочным эффектом логирования.
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Получаем объект HTTP запроса и ответа из контекста
    const httpCtx = context.switchToHttp();
    const req = httpCtx.getRequest<Request>();
    const res = httpCtx.getResponse<Response>();
    // Генерируем короткий уникальный id для запроса (используется в логах)
    const id = generateRandomCode(6);

    const { method, originalUrl, query, body } = req;

    // Исключаем из логирования запросы к статическим ресурсам bull-board
    if (originalUrl.startsWith('/bull-board')) {
      return next.handle();
    }

    // Получаем экземпляр логгера с контекстом HTTP и директорией 'api'
    const logger = this.loggerFactory.getLogger('HTTP', 'api');

    logger.formatRequestLog({
      id,
      method,
      url: originalUrl,
      query,
      body,
    });

    // Запоминаем время начала обработки запроса
    const startTime = Date.now();

    // Возвращаем observable, добавляя побочное действие после завершения запроса
    return next.handle().pipe(
      tap((responseBody) => {
        // Вычисляем длительность обработки запроса в секундах
        const durationMs = Date.now() - startTime;
        const durationSec = durationMs / 1000;

        // Получаем Content-Type ответа для фильтрации потенциально больших / бинарных данных
        const contentType = res.getHeader('content-type') || '';
        let loggedBody: any;

        // Если Content-Type — PDF, не логируем тело полностью, а вместо этого пишем метку
        if (
          typeof contentType === 'string' &&
          contentType.includes('application/pdf')
        ) {
          loggedBody = { data: '<PDF BINARY>' };
        } else {
          // Если в ответе есть поле result, логируем его, иначе логируем весь responseBody
          loggedBody = responseBody?.result ?? responseBody;
        }

        logger.formatResponseLog({
          id,
          method,
          url: originalUrl,
          statusCode: res.statusCode,
          body: loggedBody,
          durationSec,
        });
      }),
      catchError((error) => {
        // Вычисляем длительность обработки запроса в секундах
        const durationMs = Date.now() - startTime;
        const durationSec = durationMs / 1000;

        const errorBody =
          error?.response ??
          error?.message ??
          (typeof error === 'string' ? error : 'Неизвестная ошибка');

        logger.formatResponseLog({
          id,
          method,
          url: originalUrl,
          statusCode: error?.status ?? 500,
          body: errorBody,
          durationSec,
        });

        // Пробрасываем ошибку дальше, чтобы NestJS мог её обработать
        return throwError(() => error as unknown);
      }),
    );
  }
}
