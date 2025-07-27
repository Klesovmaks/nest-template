import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginRequestDto } from './dto/login.request.dto';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { RefreshTokenRequestDto } from './dto/refresh-token.request.dto';
import { RequestWithUser } from 'src/common/interface/request-with-user.interface';
import { ResponseMessage } from 'src/common/decorator/response-message.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ResponseMessage('Авторизация выполнена успешно')
  async login(@Body() dto: LoginRequestDto) {
    return await this.authService.login(dto);
  }

  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenRequestDto) {
    return this.authService.refreshTokens(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req: RequestWithUser) {
    return await this.authService.logout(req.user.userId);
  }
}
