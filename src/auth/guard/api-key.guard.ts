import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiKeyAuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    // Читаем заголовок 'x-api-key' из запроса.
    const apiKey = request.headers['x-api-key'];
    // Получаем API Key из конфига
    const validApiKey = this.configService.getOrThrow<string>('app.key');

    // Если ключ не передан — сообщаем об этом клиенту с кодом 401 Unauthorized
    if (!apiKey) {
      throw new UnauthorizedException('X-API-KEY не предоставлен');
    }

    // Сравниваем переданный ключ с ожидаемым. Если не совпадает — возвращаем 401.
    if (apiKey !== validApiKey) {
      throw new UnauthorizedException('Недействительный X-API-KEY');
    }

    return true;
  }
}
