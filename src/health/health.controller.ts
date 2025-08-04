import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  HealthCheck,
  HttpHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
  SequelizeHealthIndicator,
} from '@nestjs/terminus';
import { platform } from 'os';

@Controller('health')
export class HealthController {
  constructor(
    // Сервис для запуска health check-ов
    private health: HealthCheckService,
    // Проверка доступности HTTP-сервисов
    private http: HttpHealthIndicator,
    // Проверка подключения к базе через Sequelize
    private sequelize: SequelizeHealthIndicator,
    // Проверка состояния памяти приложения
    private memory: MemoryHealthIndicator,
    // Проверка свободного места на диске
    private disk: DiskHealthIndicator,
  ) {}

  @Get()
  // Декоратор для указания, что этот метод возвращает данные health check
  @HealthCheck()
  check() {
    /*
     * Определяем корневой путь к диску в зависимости от ОС:
     * Для Windows нужно использовать букву диска с двоеточием, например 'C:\'
     * Для UNIX-систем — корень '/'
     */
    const rootPath = platform() === 'win32' ? 'C:\\' : '/';

    // Запускаем набор проверок параллельно:
    return this.health.check([
      // Проверка подключения к базе данных Postgres через Sequelize
      () => this.sequelize.pingCheck('postgres'),
      // Проверка использования heap памяти — считается проблемой, если больше 250MB
      () => this.memory.checkHeap('memory_heap', 250 * 1024 * 1024),
      // Проверка свободного места на диске, путь зависит от ОС, тревога если занято более 90%
      () =>
        this.disk.checkStorage('disk_health', {
          thresholdPercent: 0.9,
          path: rootPath,
        }),
      // Проверка доступности внешнего HTTP ресурса (официальной документации NestJS)
      () => this.http.pingCheck('nestjs-docs', 'https://docs.nestjs.com'),
    ]);
  }
}
