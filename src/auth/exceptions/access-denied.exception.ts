import { HttpException, HttpStatus } from '@nestjs/common';

export class AccessDeniedException extends HttpException {
  constructor(error?: string) {
    super(
      {
        message: 'Доступ запрещен',
        error,
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}
