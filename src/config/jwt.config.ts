import { registerAs } from '@nestjs/config';

export interface JWTConfig {
  readonly secret: string;
  readonly accessTokenExpires: string;
  readonly refreshTokenExpires: string;
}

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET,
  accessTokenExpires: process.env.JWT_ACCESS_TOKEN_EXPIRES,
  refreshTokenExpires: process.env.JWT_REFRESH_TOKEN_EXPIRES,
}));
