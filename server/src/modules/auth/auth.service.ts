import { Injectable, UnauthorizedException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Staff, StaffRole, StaffStatus, WorkType } from '../../entities/staff.entity';
import { Patient } from '../../entities/patient.entity';
import { RefreshToken } from '../../entities/refresh-token.entity';
import { hashRefresh } from './refresh.util';
import { User, UserRole, UserType } from '../../entities/user.entity';
import { Invitation } from '../../entities/invitation.entity';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    @InjectRepository(Staff) private staffRepo: Repository<Staff>,
    @InjectRepository(Patient) private patientRepo: Repository<Patient>,
    @InjectRepository(RefreshToken) private refreshRepo: Repository<RefreshToken>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Invitation) private inviteRepo: Repository<Invitation>,
  ) {}

  async validateUser(email: string, password: string) {
    if (!email || !password) return null;
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) return null;
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return null;
    // Determine domain id for token subject by user.type (fallback to role)
    let isPatientType: boolean;
    if ((user as any).type) {
      isPatientType = ((user as any).type === UserType.Patient) && user.role === UserRole.Patient;
    } else {
      isPatientType = user.role === UserRole.Patient;
    }
    if (isPatientType) {
      const patient = await this.patientRepo.findOne({ where: { user: { id: user.id } as any } });
      if (!patient) return null;
      return { id: patient.id, email: user.email, role: user.role, userType: UserType.Patient };
    } else {
      const staff = await this.staffRepo.findOne({ where: { user: { id: user.id } as any } });
      if (!staff) return null;
      return { id: staff.id, email: user.email, role: user.role, userType: UserType.Staff };
    }
  }

  signAccessToken(user: any) {
    return this.jwt.sign(
      { sub: user.id, email: user.email, role: user.role, userType: user.userType, type: 'access' },
      { secret: process.env.JWT_SECRET || 'dev_secret_change_me', expiresIn: (process.env.ACCESS_TTL || '30m') as any },
    );
  }
  signRefreshToken(user: any) {
    return this.jwt.sign(
      { sub: user.id, email: user.email, role: user.role, userType: user.userType, type: 'refresh' },
      { secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'dev_secret_change_me', expiresIn: (process.env.REFRESH_TTL || '7d') as any },
    );
  }

  async login(body: any, res?: any) {
    const { email, password } = body || {};
    const user = await this.validateUser(email, password);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const { access, refresh } = await this.createSession(user, res);
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
    const user = { id: payload.sub, email: payload.email, role: payload.role, userType: payload.userType || (payload.role === UserRole.Patient ? UserType.Patient : UserType.Staff) };
    await this.rotateTokens(user, res);
    return { user };
  }

  logout(res: any) {
    res.clearCookie('access_token', { path: '/' });
    const r = res?.req?.cookies?.refresh_token;
    if (r) {
      const h = hashRefresh(r);
      this.refreshRepo.update({ tokenHash: h }, { revokedAt: new Date() }).catch(() => void 0);
    }
    res.clearCookie('refresh_token', { path: '/' });
    return { ok: true };
  }

  me(req: any) {
    return req.user || null;
  }

  private setAuthCookies(res: any, access: string, refresh: string) {
    const isProd = (process.env.NODE_ENV || '').toLowerCase() === 'production';
    const common = { httpOnly: true, secure: isProd, sameSite: 'lax' as const, path: '/' };
    res.cookie('access_token', access, { ...common, maxAge: parseDurationMs(process.env.ACCESS_TTL || '30m') });
    res.cookie('refresh_token', refresh, { ...common, maxAge: parseDurationMs(process.env.REFRESH_TTL || '7d') });
  }

  private refreshExpiryDate(): Date {
    const ms = parseDurationMs(process.env.REFRESH_TTL || '7d');
    return new Date(Date.now() + ms);
  }

  async createSession(user: any, res: any) {
    const access = this.signAccessToken(user);
    const refresh = this.signRefreshToken(user);
    const tokenHash = hashRefresh(refresh);
    await this.refreshRepo.save(this.refreshRepo.create({
      userId: user.id,
      userRole: user.role,
      tokenHash,
      expiresAt: this.refreshExpiryDate(),
      revokedAt: null,
    }));
    this.setAuthCookies(res, access, refresh);
    return { access, refresh };
  }

  async rotateTokens(user: any, res: any, currentRecord?: RefreshToken) {
    // Revoke current record if provided
    if (currentRecord) {
      await this.refreshRepo.update({ id: currentRecord.id }, { revokedAt: new Date() });
    }
    return this.createSession(user, res);
  }

  // Register a new patient user by default unless role provided explicitly
  async register(body: any) {
    const { email, password, role } = body || {};
    if (!email || !password) throw new BadRequestException('email and password are required');
    const exists = await this.userRepo.findOne({ where: { email } });
    if (exists) throw new BadRequestException('Email already in use');
    const passwordHash = await bcrypt.hash(password, 10);
    const assignedRole: UserRole = role || UserRole.Patient;
    const assignedType: UserType = assignedRole === UserRole.Patient ? UserType.Patient : UserType.Staff;
    const user = await this.userRepo.save(this.userRepo.create({ email, passwordHash, role: assignedRole, type: assignedType } as Partial<User>));
    return { id: user.id, email: user.email, role: user.role };
  }

  async invite(body: any) {
    const { email, type, role, staffId, patientId, expiresIn } = body || {};
    if (!email) throw new BadRequestException('email required');
    const existing = await this.userRepo.findOne({ where: { email } });
    if (existing) throw new BadRequestException('User already exists with this email');
    let assignedRole = role as UserRole | undefined;
    if (type === 'patient') assignedRole = UserRole.Patient;
    if (!assignedRole) throw new BadRequestException('role required');
    if (assignedRole !== UserRole.Patient && !staffId && type !== 'staff') throw new BadRequestException('staffId required for staff');
    const token = crypto.randomBytes(32).toString('hex');
    const ttl = typeof expiresIn === 'string' ? parseDurationMs(expiresIn) : parseDurationMs('7d');
    const expiresAt = new Date(Date.now() + ttl);
    const inv = this.inviteRepo.create({ email, role: assignedRole, staffId: staffId || null, patientId: patientId || null, token, expiresAt, claimedAt: null, claimedByUserId: null });
    const saved = await this.inviteRepo.save(inv);
    return { invitationId: saved.id, token, expiresAt };
  }

  async acceptInvite(body: any, res: any) {
    const { token, password } = body || {};
    if (!token || !password) throw new BadRequestException('token and password required');
    const inv = await this.inviteRepo.findOne({ where: { token } });
    if (!inv) throw new BadRequestException('Invalid token');
    if (inv.claimedAt) throw new BadRequestException('Invitation already claimed');
    if (new Date(inv.expiresAt) < new Date()) throw new BadRequestException('Invitation expired');
    const existing = await this.userRepo.findOne({ where: { email: inv.email } });
    if (existing) throw new BadRequestException('User already exists with this email');
    const passwordHash = await bcrypt.hash(password, 10);
    const userType = inv.role === UserRole.Patient ? UserType.Patient : UserType.Staff;
    const user = await this.userRepo.save(this.userRepo.create({ email: inv.email, passwordHash, role: inv.role, type: userType } as Partial<User>));
    if (inv.staffId) {
      await this.staffRepo.update({ id: inv.staffId }, { user: { id: user.id } as any });
    }
    if (inv.patientId) {
      await this.patientRepo.update({ id: inv.patientId }, { user: { id: user.id } as any });
    }
    await this.inviteRepo.update({ id: inv.id }, { claimedAt: new Date(), claimedByUserId: user.id });
    const sub = inv.staffId || inv.patientId;
    const sessionUser = { id: sub, email: user.email, role: user.role, userType } as any;
    await this.createSession(sessionUser, res);
    return { user: sessionUser };
  }

  async bootstrapAdmin(body: any, res: any) {
    const { email, password, firstName = 'Admin', lastName = '', secret } = body || {};
    if (!email || !password) throw new BadRequestException('email and password are required');

    const count = await this.userRepo.count();
    const bootSecret = process.env.BOOTSTRAP_SECRET;
    if (count > 0) {
      if (!bootSecret || secret !== bootSecret) {
        throw new ForbiddenException('bootstrap disabled (already initialized)');
      }
    }

    const existing = await this.userRepo.findOne({ where: { email } });
    if (existing) throw new BadRequestException('Email already in use');

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await this.userRepo.save(this.userRepo.create({ email, passwordHash, role: UserRole.Admin, type: UserType.Staff } as Partial<User>));

    await this.staffRepo.save(this.staffRepo.create({
      user: { id: user.id } as any,
      role: StaffRole.Admin,
      firstName,
      lastName,
      status: StaffStatus.Active,
      workType: WorkType.FullTime,
    } as any));
    const createdStaff = await this.staffRepo.findOne({ where: { user: { id: user.id } as any } });
    const sessionUser = { id: createdStaff?.id, email: user.email, role: UserRole.Admin, userType: UserType.Staff } as any;
    await this.createSession(sessionUser, res);
    return { user: { id: user.id, email: user.email, role: user.role }, staff: { id: createdStaff?.id, firstName, lastName } };
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
