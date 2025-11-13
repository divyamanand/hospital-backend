import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly svc: AuthService) {}

  @Post('login')
  login(@Body() body: any) {
    return this.svc.login(body);
  }

  @Post('refresh')
  refresh(@Body() body: any) {
    return this.svc.refresh(body);
  }

  @Post('register')
  register(@Body() body: any) {
    return this.svc.register(body);
  }

  @Get('me')
  me(@Req() req: any) {
    return this.svc.me(req);
  }
}
