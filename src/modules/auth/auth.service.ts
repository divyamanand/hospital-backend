import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private readonly jwt: JwtService) {}

  // NOTE: Replace with real user lookup and password verification
  async validateUser(email: string, password: string) {
    if (!email || !password) return null;
    // Accept any non-empty for demo; plug in real check against Staff/Patient later
    return { id: email, email } as any;
  }

  signAccessToken(user: any) {
    return this.jwt.sign({ sub: user.id, email: user.email, type: 'access' }, { secret: process.env.JWT_SECRET || 'dev_secret_change_me', expiresIn: process.env.ACCESS_TTL || '15m' });
  }
  signRefreshToken(user: any) {
    return this.jwt.sign({ sub: user.id, email: user.email, type: 'refresh' }, { secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'dev_secret_change_me', expiresIn: process.env.REFRESH_TTL || '7d' });
  }

  async login(body: any, res?: any) {
    const { email, password } = body || {};
    const user = await this.validateUser(email, password);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const access = this.signAccessToken(user);
    const refresh = this.signRefreshToken(user);
    this.setAuthCookies(res, access, refresh);
    return { user };
  }

  async refreshCookie(req: any, res: any) {
    const token = req.cookies?.refresh_token;
    if (!token) throw new UnauthorizedException('Missing refresh token');
    let payload: any;
    try {
      payload = await this.jwt.verifyAsync(token, { secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'dev_secret_change_me' });
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const user = { id: payload.sub, email: payload.email };
    const access = this.signAccessToken(user);
    const refresh = this.signRefreshToken(user);
    this.setAuthCookies(res, access, refresh);
    return { user };
  }

  logout(res: any) {
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });
    return { ok: true };
  }

  me(req: any) {
    return req.user || null;
  }

  private setAuthCookies(res: any, access: string, refresh: string) {
    const isProd = (process.env.NODE_ENV || '').toLowerCase() === 'production';
    const common = { httpOnly: true, secure: isProd, sameSite: 'lax' as const, path: '/' };
    res.cookie('access_token', access, { ...common, maxAge: parseDurationMs(process.env.ACCESS_TTL || '15m') });
    res.cookie('refresh_token', refresh, { ...common, maxAge: parseDurationMs(process.env.REFRESH_TTL || '7d') });
  }

  // Minimal placeholder; replace with persistence as needed
  async register(body: any) {
    const { email } = body || {};
    return { id: email, email };
  }
}

function parseDurationMs(input: string): number {
  // crude parser: supports s,m,h,d suffixes
  const m = String(input).match(/^(\d+)([smhd])$/);
  if (!m) return 15 * 60 * 1000;
  const n = parseInt(m[1], 10);
  const mult = m[2] === 's' ? 1000 : m[2] === 'm' ? 60000 : m[2] === 'h' ? 3600000 : 86400000;
  return n * mult;
}
