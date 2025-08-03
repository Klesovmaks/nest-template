import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { LoginRequestDto } from './dto/login-request.dto';
import * as bcrypt from 'bcrypt';
import { JWTConfig } from 'src/config/jwt.config';
import { ConfigService } from '@nestjs/config';
import { SALT_ROUNDS } from 'src/common/utils/constants';
import { JwtPayload } from './interface/jwt-payload.interface';
import { InvalidCredentialsException } from './exceptions/invalid-credentials.exception';
import { LoginResponseDto } from './dto/login-response.dto';
import { RefreshTokenRequestDto } from './dto/refresh-token-request.dto';
import { AccessDeniedException } from './exceptions/access-denied.exception';
import { RefreshTokenResponseDto } from './dto/refresh-token-response.dto';

@Injectable()
export class AuthService {
  // Конфигурация JWT (секрет и сроки действия токенов)
  private readonly jwtConfig: JWTConfig;
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    readonly configService: ConfigService,
  ) {
    // Получаем конфигурацию JWT
    this.jwtConfig = configService.getOrThrow<JWTConfig>('jwt');
  }

  /**
   * Вход пользователя.
   * Проверяет учетные данные, создает пару access и refresh токенов.
   *
   * @async
   * @param {LoginRequestDto} dto - - Данные запроса на логин (логин и пароль)
   * @returns {Promise<LoginResponseDto>} - Объект с access и refresh токенами и их временем жизни
   */
  async login(dto: LoginRequestDto): Promise<LoginResponseDto> {
    const { login, password } = dto;

    // Находим пользователя по логину
    const user = await this.userService.findByLogin(login);
    if (!user) throw new InvalidCredentialsException();

    // Проверяем валидность пароля с помощью bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) throw new InvalidCredentialsException();

    // Формируем payload для JWT — основные данные пользователя для токена
    const payload: JwtPayload = {
      login: user.login,
      sub: user.id,
      role: user.role,
    };

    // Генерируем access токен с заданным сроком жизни и секретом
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.jwtConfig.accessTokenExpires,
      secret: this.jwtConfig.secret,
    });
    // Генерируем refresh токен (более долгоживущий)
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.jwtConfig.refreshTokenExpires,
      secret: this.jwtConfig.secret,
    });
    // Хэшируем refresh токен перед сохранением для безопасности
    const refreshTokenHash: string = await bcrypt.hash(
      refreshToken,
      SALT_ROUNDS,
    );

    // Сохраняем хэш refresh токена в базе, связанный с пользователем
    await this.userService.setCurrentRefreshToken(refreshTokenHash, user.id);

    // Возвращаем токены и их время жизни клиенту
    return {
      accessToken,
      accessTokenExpires: this.jwtConfig.accessTokenExpires,
      refreshToken,
      refreshTokenExpires: this.jwtConfig.refreshTokenExpires,
    };
  }

  /**
   * Обновление токенов по refresh токену.
   * Проверяет валидность и соответствие refresh токена, выдаёт новые токены.
   *
   * @async
   * @param {RefreshTokenRequestDto} dto - Объект с refresh токеном
   * @returns {Promise<RefreshTokenResponseDto>} - Обновленная пара токенов (access + refresh)
   */
  async refreshToken(
    dto: RefreshTokenRequestDto,
  ): Promise<RefreshTokenResponseDto> {
    const { refreshToken } = dto;

    // Проверяем и разбираем refresh токен, получаем из него payload
    const { sub } = this.parseRefreshToken(refreshToken);

    // Находим пользователя по id из токена
    const user = await this.userService.findById(sub);
    // Проверяем, что пользователь существует, у него есть сохранённый refresh токен и клиент прислал refresh токен
    if (!user || !user.refreshTokenHash || !refreshToken)
      throw new InvalidCredentialsException();

    // Сравниваем пришедший refresh токен с хэшем, сохранённым в БД
    const isRefreshTokenMatching = await bcrypt.compare(
      refreshToken,
      user.refreshTokenHash,
    );
    // Сравниваем пришедший refresh токен с хэшем, сохранённым в БД
    if (!isRefreshTokenMatching) {
      await this.userService.removeRefreshToken(sub);
      throw new InvalidCredentialsException();
    }

    // Формируем новый payload для создания новых токенов
    const payload: JwtPayload = {
      login: user.login,
      sub: user.id,
      role: user.role,
    };

    // Генерируем новый access токен
    const newAccessToken = this.jwtService.sign(payload, {
      expiresIn: this.jwtConfig.accessTokenExpires,
      secret: this.jwtConfig.secret,
    });
    // Генерируем новый refresh токен
    const newRefreshToken = this.jwtService.sign(payload, {
      expiresIn: this.jwtConfig.refreshTokenExpires,
      secret: this.jwtConfig.secret,
    });
    // Хэшируем новый refresh токен для безопасного хранения
    const newRefreshTokenHash: string = await bcrypt.hash(
      newRefreshToken,
      SALT_ROUNDS,
    );

    // Сохраняем новый хэш refresh токена в базе
    await this.userService.setCurrentRefreshToken(newRefreshTokenHash, user.id);

    // Возвращаем новые токены и их время жизни клиенту
    return {
      accessToken: newAccessToken,
      accessTokenExpires: this.jwtConfig.accessTokenExpires,
      refreshToken: newRefreshToken,
      refreshTokenExpires: this.jwtConfig.refreshTokenExpires,
    };
  }

  /**
   * Логаут — удаление refresh токена пользователя из базы для инвалидирования сессии.
   *
   * @async
   * @param {JwtPayload} jwtPayload - JWT Payload с идентификатором пользователя
   * @returns {Promise<void>}
   */
  async logout(jwtPayload: JwtPayload): Promise<void> {
    // Удаляем сохраненный refresh токен у пользователя
    await this.userService.removeRefreshToken(jwtPayload.sub);
  }

  /**
   * Вспомогательный метод — проверяет валидность refresh токена, возвращает его payload.
   *
   * @private
   * @param {string} refreshToken - JWT refresh токен
   * @returns {JwtPayload} - Распаршенный и проверенный JWT payload (JwtPayload)
   * @throws AccessDeniedException при недействительном или просроченном токене
   */
  private parseRefreshToken(refreshToken: string): JwtPayload {
    try {
      // Проверяем токен и получаем payload
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.jwtConfig.secret,
      });
      // Приводим payload к ожидаемому интерфейсу (могут быть дополнительные стандартные поля JWT)
      return payload as JwtPayload;
    } catch (error) {
      // Если токен невалиден или просрочен — бросаем исключение с сообщением ошибки
      throw new AccessDeniedException(error.message as string);
    }
  }
}
