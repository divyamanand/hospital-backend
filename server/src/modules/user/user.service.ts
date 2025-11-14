import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { User, UserRole, UserType } from '../../entities/user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  async create(data: any) {
    const { email, password, role, firstName, lastName, gender, dateOfBirth, phone, type } = data || {};
    if (!email || !password || !role) throw new BadRequestException('email, password, role required');
    const exists = await this.repo.findOne({ where: { email } });
    if (exists) throw new BadRequestException('Email already in use');
    const passwordHash = await bcrypt.hash(password, 10);
    const userType: UserType = type || (role === UserRole.Patient ? UserType.Patient : UserType.Staff);
    const ent = this.repo.create({ email, passwordHash, role, type: userType, firstName: firstName ?? null, lastName: lastName ?? null, gender: gender ?? null, dateOfBirth: dateOfBirth ?? null, phone: phone ?? null } as Partial<User>);
    return this.repo.save(ent);
  }

  async findAll(filter?: any) {
    const qb = this.repo.createQueryBuilder('u');
    qb.where('1=1');
    if (filter?.role) qb.andWhere('u.role = :role', { role: filter.role });
    if (filter?.type) qb.andWhere('u.type = :type', { type: filter.type });
    if (filter?.emailLike) qb.andWhere('LOWER(u.email) LIKE LOWER(:em)', { em: `%${filter.emailLike}%` });
    if (filter?.gender) qb.andWhere('u.gender = :g', { g: filter.gender });
    if (filter?.minAge || filter?.maxAge) {
      // Age filtering approximate via dateOfBirth
      const now = new Date();
      if (filter.minAge) {
        const maxDob = new Date(now); maxDob.setFullYear(now.getFullYear() - filter.minAge);
        qb.andWhere('u.dateOfBirth <= :maxDob', { maxDob: maxDob.toISOString().slice(0,10) });
      }
      if (filter.maxAge) {
        const minDob = new Date(now); minDob.setFullYear(now.getFullYear() - filter.maxAge - 1); // subtract extra year boundary
        qb.andWhere('u.dateOfBirth >= :minDob', { minDob: minDob.toISOString().slice(0,10) });
      }
    }
    return qb.getMany();
  }

  findOne(id: string) { return this.repo.findOne({ where: { id } }); }

  async update(id: string, data: any) {
    const updates: any = { ...data };
    if (data.password) {
      updates.passwordHash = await bcrypt.hash(data.password, 10);
      delete updates.password;
    }
    await this.repo.update({ id }, updates);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.repo.delete({ id });
    return { id, removed: true } as any;
  }
}
