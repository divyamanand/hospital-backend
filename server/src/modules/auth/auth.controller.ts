import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';

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

  // Admin/Receptionist sends an invitation to set password later
  @Post('invite')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin','receptionist')
  invite(@Body() body: any) {
    return this.svc.invite(body);
  }

  // Public endpoint: accept invitation with token and set password
  @Post('accept-invite')
  acceptInvite(@Body() body: any, @Res({ passthrough: true }) res: any) {
    return this.svc.acceptInvite(body, res);
  }

  @Post('request-password-reset')
  requestPasswordReset(@Body() body: any, @Req() req: any) {
    const ip = req?.ip || req?.headers?.['x-forwarded-for'] || null;
    return this.svc.requestPasswordReset(body, ip);
  }

  @Post('confirm-password-reset')
  confirmPasswordReset(@Body() body: any, @Res({ passthrough: true }) res: any) {
    return this.svc.confirmPasswordReset(body, res);
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: any) { return this.svc.logout(res); }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() req: any) { return this.svc.me(req); }

  // One-time initializer: create the first admin when no users exist, or with secret
  @Post('bootstrap-admin')
  bootstrapAdmin(@Body() body: any, @Res({ passthrough: true }) res: any) {
    return this.svc.bootstrapAdmin(body, res);
  }

  @Post('reset-password')
  @Roles('admin')
  @UseGuards(JwtAuthGuard)
  resetPassword(@Body() body: any) {
    return this.svc.resetPassword(body);
  }
}
