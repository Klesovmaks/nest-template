export interface LoggerRequest {
  readonly id: string;
  readonly context?: string;
  readonly method: string;
  readonly url: string;
  readonly query?: object;
  readonly body?: object;
}
