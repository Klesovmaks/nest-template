import { IsString } from 'class-validator';

export class RefreshTokenRequestDto {
  @IsString()
  readonly userId: string;

  @IsString()
  readonly refreshToken: string;
}
