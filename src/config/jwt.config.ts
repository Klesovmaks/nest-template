import { registerAs } from '@nestjs/config';

export interface JWTConfig {
  readonly secret: string;
  readonly accessTokenExpires: number;
  readonly refreshTokenExpires: number;
}

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET,
  accessTokenExpires: Number(process.env.JWT_ACCESS_TOKEN_EXPIRES),
  refreshTokenExpires: Number(process.env.JWT_REFRESH_TOKEN_EXPIRES),
}));
