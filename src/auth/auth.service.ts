import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { LoginRequestDto } from './dto/login.request.dto';
import * as bcrypt from 'bcrypt';
import { RefreshTokenRequestDto } from './dto/refresh-token.request.dto';
import { JWTConfig } from 'src/config/jwt.config';
import { ConfigService } from '@nestjs/config';
import { SALT_ROUNDS } from 'src/common/utils/constants';
import { UserPayload } from './interface/user-payload.interface';
import { InvalidCredentialsException } from './exceptions/invalid-credentials.exception';

@Injectable()
export class AuthService {
  private readonly jwtConfig: JWTConfig;
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    readonly configService: ConfigService,
  ) {
    this.jwtConfig = configService.getOrThrow<JWTConfig>('jwt');
  }

  async login(dto: LoginRequestDto) {
    const { login, password } = dto;

    const user = await this.userService.findByLogin(login);
    if (!user) throw new InvalidCredentialsException();

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) throw new InvalidCredentialsException();

    const payload: UserPayload = {
      login: user.login,
      userId: user.id,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.jwtConfig.accessTokenExpires,
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.jwtConfig.refreshTokenExpires,
    });
    const refreshTokenHash: string = await bcrypt.hash(
      refreshToken,
      SALT_ROUNDS,
    );

    await this.userService.setCurrentRefreshToken(refreshTokenHash, user.id);

    return {
      accessToken,
      accessTokenExpires: this.jwtConfig.accessTokenExpires,
      refreshToken,
      refreshTokenExpires: this.jwtConfig.refreshTokenExpires,
    };
  }

  async refreshTokens(dto: RefreshTokenRequestDto) {
    const { userId, refreshToken } = dto;

    const user = await this.userService.findById(userId);
    if (!user || !user.refreshTokenHash)
      throw new InvalidCredentialsException();

    const isRefreshTokenMatching = await bcrypt.compare(
      refreshToken,
      user.refreshTokenHash,
    );
    if (!isRefreshTokenMatching) throw new InvalidCredentialsException();

    const payload: UserPayload = {
      login: user.login,
      userId: user.id,
      role: user.role,
    };
    const newAccessToken = this.jwtService.sign(payload, {
      expiresIn: this.jwtConfig.accessTokenExpires,
    });
    const newRefreshToken = this.jwtService.sign(payload, {
      expiresIn: this.jwtConfig.refreshTokenExpires,
    });

    const newRefreshTokenHash: string = await bcrypt.hash(
      newRefreshToken,
      SALT_ROUNDS,
    );
    await this.userService.setCurrentRefreshToken(newRefreshTokenHash, user.id);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(userId: string): Promise<void> {
    await this.userService.removeRefreshToken(userId);
  }
}
