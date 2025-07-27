import { Injectable, Scope } from '@nestjs/common';
import {
  createLogger,
  format,
  Logger as WinstonLogger,
  transports,
} from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import { LoggerResponse } from './interface/loggerResponse.interface';
import { LoggerRequest } from './interface/loggerRequest.interface';
import {
  REDACTED_PLACEHOLDER,
  SENSITIVE_KEYS,
} from 'src/common/utils/constants';

const { combine, timestamp, printf, errors, align } = format;

/**
 * Пользовательский формат вывода лога.
 *
 * Строка формируется как:
 *   [timestamp] [LEVEL] [context] message
 * Если есть stack trace, добавляется в отдельной строке.
 */
const customFormat = printf(
  (info: {
    timestamp?: string;
    level: string;
    message: string;
    context?: string;
    stack?: string;
  }) => {
    const ts = info.timestamp ?? new Date().toISOString();
    const level = info.level.toUpperCase();
    const ctx = info.context ? `[${info.context}] ` : '';
    const msg = info.message;
    const stack = info.stack ? `\n${info.stack}` : '';
    return `${ts} [${level}] ${ctx}${msg}${stack}`;
  },
);

/**
 * Рекурсивно проходит по объекту или массиву и маскирует чувствительные данные,
 * ключи которых определены в множестве `SENSITIVE_KEYS`.
 *
 * Для строковых значений вызывается `maskValue`, для остальных маскируемых значений подставляется строка `'***REDACTED***'`.
 *
 * Обрабатывает вложенные объекты и массивы, предотвращая бесконечную рекурсию через параметр `seen`.
 *
 * @param {unknown} data - Входные данные для маскировки, могут быть любого типа.
 * @param {WeakSet<object>} [seen=new WeakSet()] - Множество уже обработанных объектов для обхода циклических ссылок.
 * @returns {unknown} Маскированная версия входных данных с сохранением структуры.
 */
function maskSensitiveData(
  data: unknown,
  seen: WeakSet<object> = new WeakSet<object>(),
): unknown {
  if (data == null || typeof data !== 'object') return data;

  if (seen.has(data)) return data;
  seen.add(data);

  if (Array.isArray(data)) {
    return data.map((item) => maskSensitiveData(item, seen));
  }

  const masked: Record<string, unknown> = {};
  const dataObj = data as Record<string, unknown>;

  for (const key of Object.keys(dataObj)) {
    const value = dataObj[key];

    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      masked[key] = REDACTED_PLACEHOLDER;
    } else if (value && typeof value === 'object') {
      masked[key] = maskSensitiveData(value, seen);
    } else {
      masked[key] = value;
    }
  }

  return masked;
}

/**
 * Сервис логирования, оборачивающий Winston с поддержкой DailyRotateFile,
 * а также маскированием чувствительных данных в логах запросов и ответов.
 *
 * Используется Scope.TRANSIENT для возможности создания независимых инстансов с разным контекстом.
 *
 * @export
 * @class LoggerService
 * @typedef {LoggerService}
 */
@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService {
  private logger: WinstonLogger;

  /**
   * @param context - Контекст логгера (например, имя модуля или компонента).
   * @param logDir - Директория для хранения логов (по умолчанию 'api').
   */
  constructor(
    private context: string,
    logDir = 'api',
  ) {
    const fileTransport = new DailyRotateFile({
      dirname: `logs/${logDir}`,
      filename: `%DATE%.log`,
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '50m',
      maxFiles: '120d',
      level: 'debug',
      format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
        errors({ stack: true }),
        customFormat,
      ),
    });

    this.logger = createLogger({
      level: 'debug',
      format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
        align(),
        errors({ stack: true }),
        customFormat,
      ),
      defaultMeta: { context },
      transports: [new transports.Console(), fileTransport],
    });
  }

  info(message: string, meta?: Record<string, unknown>) {
    this.logger.info(message, { context: this.context, ...meta });
  }

  error(message: string, trace?: string, meta?: Record<string, unknown>) {
    this.logger.error(message, {
      stack: trace,
      context: this.context,
      ...meta,
    });
  }

  warn(message: string, meta?: Record<string, unknown>) {
    this.logger.warn(message, { context: this.context, ...meta });
  }

  debug(message: string, meta?: Record<string, unknown>) {
    this.logger.debug(message, { context: this.context, ...meta });
  }

  /**
   * Логирует информацию о входящем запросе с маскировкой чувствительных данных.
   *
   * @param {LoggerRequest}
   */
  formatRequestLog = ({
    id,
    context,
    method,
    url,
    query = {},
    body = {},
  }: LoggerRequest) => {
    const maskedQuery = maskSensitiveData(query);
    const maskedBody = maskSensitiveData(body);
    const contextPart = context ? `[${context}] ` : '';

    this.logger.info(
      `${contextPart}[Req ${id}] ${method} ${url} | Query: ${JSON.stringify(maskedQuery)} | Body: ${JSON.stringify(maskedBody)}`,
    );
  };

  /**
   * Логирует информацию об ответе с маскировкой чувствительных данных.
   * Если присутствует errorMessage, логируется как error, иначе как info.
   *
   * @param {LoggerResponse}
   */
  formatResponseLog = ({
    id,
    context,
    method,
    url,
    body = {},
    statusCode,
    errorMessage,
    durationSec,
  }: LoggerResponse) => {
    const maskedBody = maskSensitiveData(body);
    const contextPart = context ? `[${context}] ` : '';
    const errorMessagePart = errorMessage ? ` | error: ${errorMessage}` : '';
    const durationPart = durationSec ? ` | duration: ${durationSec}` : '';
    const message = `${contextPart}[Res ${id}] ${method} ${url}${durationPart} | Status: ${statusCode} | Body: ${JSON.stringify(maskedBody)}${errorMessagePart}`;

    if (errorMessage) {
      this.logger.error(message);
    } else {
      this.logger.info(message);
    }
  };
}
