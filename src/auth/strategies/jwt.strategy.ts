import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../interface/jwt-payload.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(readonly configService: ConfigService) {
    super({
      // Извлекаем JWT из Authorization заголовка Bearer token
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // Секретный ключ для проверки подписи JWT, берется из конфига
      secretOrKey: configService.getOrThrow<string>('jwt.secret'),
      // Не пропускаем просроченные токены
      ignoreExpiration: false,
    });
  }

  // Возвращает объект, который будет доступен в req.user
  validate(payload: JwtPayload) {
    return {
      sub: payload.sub,
      login: payload.login,
      role: payload.role,
    };
  }
}
