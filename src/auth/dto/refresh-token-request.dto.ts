import { IsString } from 'class-validator';

export class RefreshTokenRequestDto {
  @IsString()
  readonly refreshToken: string;
}
