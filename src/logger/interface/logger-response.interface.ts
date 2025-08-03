export interface LoggerResponse {
  readonly id: string;
  readonly context?: string;
  readonly method: string;
  readonly url: string;
  readonly body?: object;
  readonly statusCode?: number;
  readonly errorMessage?: string;
  readonly durationSec?: number;
}
