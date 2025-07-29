import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AccessDeniedException } from '../exceptions/access-denied.exception';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = any>(
    err: any,
    user: TUser,
    info?: { message?: string },
  ) {
    if (err || !user) {
      throw new AccessDeniedException(info?.message);
    }
    return user;
  }
}
