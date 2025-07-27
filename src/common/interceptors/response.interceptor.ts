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
  statusCode: number;
  message: string;
  data: T;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const httpContext = context.switchToHttp();
    const response = httpContext.getResponse();
    const message = this.getResponseMessage(context);

    if (response.getHeader('Content-Type') === 'application/pdf') {
      return next.handle() as Observable<Response<T>>;
    }

    return next.handle().pipe(
      map(
        (data: any): Response<T> => ({
          message: message || 'Успешно',
          statusCode: response.statusCode,
          data: data?.result ?? data,
        }),
      ),
    );
  }

  private getResponseMessage(context: ExecutionContext): string {
    const [controller, handler] = [context.getClass(), context.getHandler()];
    const controllerMessage: string = Reflect.getMetadata(
      RESPONSE_MESSAGE,
      controller,
    );
    const handlerMessage: string = Reflect.getMetadata(
      RESPONSE_MESSAGE,
      handler,
    );
    return handlerMessage ?? controllerMessage;
  }
}
