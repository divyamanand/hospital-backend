import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshToken } from '../../entities/refresh-token.entity';
import { hashRefresh } from './refresh.util';
import { AuthService } from './auth.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly jwt: JwtService,
    @InjectRepository(RefreshToken) private refreshRepo: Repository<RefreshToken>,
    private readonly authSvc: AuthService,
  ) {}

  async use(req: any, res: any, next: () => void) {
    // Bypass for auth endpoints
    if (req.path?.startsWith('/auth/')) return next();

    const access = req.cookies?.access_token as string | undefined;
    const refresh = req.cookies?.refresh_token as string | undefined;

    // Try access token first
    if (access) {
      try {
        const payload: any = await this.jwt.verifyAsync(access, { secret: process.env.JWT_SECRET || 'dev_secret_change_me' });
        req.user = { ...payload, id: payload?.sub };
        return next();
      } catch (e) {
        // if not expired or other error, proceed to refresh logic
      }
    }

    // If access missing/expired, try refresh
    if (refresh) {
      try {
        const payload: any = await this.jwt.verifyAsync(refresh, { secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'dev_secret_change_me' });
        const h = hashRefresh(refresh);
        const rec = await this.refreshRepo.findOne({ where: { tokenHash: h } });
        if (!rec || rec.revokedAt) throw new UnauthorizedException('Refresh revoked');
        if (rec.expiresAt && new Date(rec.expiresAt) < new Date()) throw new UnauthorizedException('Refresh expired');
        const user = { id: payload.sub, email: payload.email, role: payload.role };
        // rotate tokens and set cookies
        const tokens = await this.authSvc.rotateTokens(user, res, rec);
        req.user = { ...payload, id: payload.sub };
        return next();
      } catch (e) {
        // On refresh failure: clear cookies and reject
        res.clearCookie('access_token', { path: '/' });
        res.clearCookie('refresh_token', { path: '/' });
        throw new UnauthorizedException('Authentication required');
      }
    }

    // No tokens present
    return next();
  }
}
