import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidCredentialsException extends HttpException {
  constructor(message: string = 'Неверные учетные данные') {
    super(message, HttpStatus.UNAUTHORIZED);
  }
}
