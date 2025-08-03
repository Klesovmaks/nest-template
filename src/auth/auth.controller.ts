import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginRequestDto } from './dto/login-request.dto';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { ResponseMessage } from 'src/common/decorator/response-message.decorator';
import { JwtPayload } from './interface/jwt-payload.interface';
import { RefreshTokenRequestDto } from './dto/refresh-token-request.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ResponseMessage('Авторизация выполнена успешно')
  async login(@Body() dto: LoginRequestDto) {
    return await this.authService.login(dto);
  }

  @Post('refresh')
  @ResponseMessage('Обновление токена выполнено успешно')
  async refresh(@Body() dto: RefreshTokenRequestDto) {
    return this.authService.refreshToken(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ResponseMessage('Выход выполнен успешно')
  async logout(@Req() req: { user: JwtPayload }) {
    return await this.authService.logout(req.user);
  }
}
