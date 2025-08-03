import { Injectable } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { ConfigService } from '@nestjs/config';

/**
 * Фабрика для создания и кэширования экземпляров LoggerService.
 * Обеспечивает повторное использование логгеров с одинаковым контекстом и директорией логов.
 *
 * @export
 * @class LoggerFactory
 * @typedef {LoggerFactory}
 */
@Injectable()
export class LoggerFactory {
  /**
   * Кэш логгеров.
   * Ключ: строка в формате `${context}-${logDir}`.
   * Значение: экземпляр LoggerService.
   */
  private loggers = new Map<string, LoggerService>();

  constructor(private configService: ConfigService) {}

  /**
   * Возвращает экземпляр LoggerService с заданным контекстом и директорией логов.
   * Если логгер с таким ключом не создан, создаёт новый и добавляет в кэш.
   *
   * @param {string} context - Контекст логгера (например, название модуля или компонента)
   * @param {string} [logDir='api'] - Папка для хранения логов (по умолчанию 'api')
   * @returns {LoggerService}
   */
  getLogger(context: string, logDir: string = 'api'): LoggerService {
    const key = `${context}-${logDir}`;
    let logger = this.loggers.get(key);
    if (!logger) {
      // Создание нового экземпляра LoggerService с контекстом и директорией
      logger = new LoggerService(context, logDir, this.configService);
      // Сохранение в кэш
      this.loggers.set(key, logger);
    }
    return logger;
  }
}
