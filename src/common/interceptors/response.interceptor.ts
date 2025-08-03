import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Response,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { RESPONSE_MESSAGE } from '../decorator/response-message.decorator';

export interface Response<T> {
  message: string;
  statusCode: number;
  data: T;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    // Получаем контекст HTTP запроса
    const httpContext = context.switchToHttp();
    // Получаем объект HTTP ответа
    const response = httpContext.getResponse();
    // Получаем кастомное сообщение из метаданных
    const message = this.getResponseMessage(context);

    // Если Content-Type установлен в 'application/pdf', просто возвращаем данные без изменений
    if (response.getHeader('Content-Type') === 'application/pdf') {
      return next.handle() as Observable<Response<T>>;
    }

    // Обрабатываем данные ответа, маппируем в стандартный формат
    return next.handle().pipe(
      map(
        (data: any): Response<T> => ({
          // Используем сообщение из метаданных или дефолт
          message: message || 'Успешно',
          // Передаем HTTP статус
          statusCode: response.statusCode,
          // Поддержка вложенного result или обычных данных
          data: data?.result ?? data,
        }),
      ),
    );
  }

  /**
   * Метод получения сообщения ответа из метаданных контроллера или метода
   *
   * @private
   * @param {ExecutionContext} context
   * @returns {string}
   */
  private getResponseMessage(context: ExecutionContext): string {
    const [controller, handler] = [context.getClass(), context.getHandler()];
    // Считываем метаданные с контроллера
    const controllerMessage: string = Reflect.getMetadata(
      RESPONSE_MESSAGE,
      controller,
    );
    // Считываем метаданные с конкретного обработчика (метода)
    const handlerMessage: string = Reflect.getMetadata(
      RESPONSE_MESSAGE,
      handler,
    );

    // Приоритет - сообщение с метода, если его нет — сообщение с контроллера
    return handlerMessage ?? controllerMessage;
  }
}
