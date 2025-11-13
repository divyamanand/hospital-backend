import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly svc: AuthService) {}

  @Post('login')
  login(@Body() body: any, @Res({ passthrough: true }) res: any) {
    return this.svc.login(body, res);
  }

  @Post('refresh')
  refresh(@Req() req: any, @Res({ passthrough: true }) res: any) {
    return this.svc.refreshCookie(req, res);
  }

  @Post('register')
  register(@Body() body: any) {
    return this.svc.register(body);
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: any) { return this.svc.logout(res); }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() req: any) { return this.svc.me(req); }
}
