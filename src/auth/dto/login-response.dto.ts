export class LoginResponseDto {
  readonly accessToken: string;
  readonly accessTokenExpires: number;
  readonly refreshToken: string;
  readonly refreshTokenExpires: number;
}
