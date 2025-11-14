import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Staff } from '../../entities/staff.entity';
import { Timings } from '../../entities/timings.entity';
import { Leave } from '../../entities/leave.entity';
import { User, UserRole, UserType } from '../../entities/user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(Staff) private repo: Repository<Staff>,
    @InjectRepository(Timings) private timingsRepo: Repository<Timings>,
    @InjectRepository(Leave) private leaveRepo: Repository<Leave>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async create(data: any) {
    const { email, password, role, firstName, lastName, dateOfBirth, gender, phone, notes } = data || {};
    if (!role) throw new Error('staff role is required');
    if (email && password) {
      const exists = await this.userRepo.findOne({ where: { email } });
      if (exists) throw new Error('Email already in use');
      const passwordHash = await bcrypt.hash(password, 10);
      const user = await this.userRepo.save(this.userRepo.create({
        email,
        passwordHash,
        role,
        type: UserType.Staff,
        firstName: firstName ?? null,
        lastName: lastName ?? null,
        dateOfBirth: dateOfBirth ?? null,
        gender: gender ?? null,
        phone: phone ?? null,
      } as Partial<User>));
      const staff = this.repo.create({ notes: notes ?? null, user: { id: user.id } as any });
      return this.repo.save(staff);
    }
    // Create staff profile only; invite later to set password
    const staff = this.repo.create({ notes: notes ?? null });
    return this.repo.save(staff);
  }
  findAll() { return this.repo.find({ relations: ['user'] }); }
  findOne(id: string) { return this.repo.findOne({ where: { id }, relations: ['user'] }); }
  async update(id: string, data: any) {
    // Split user vs staff fields
    const staffUpdates: Partial<Staff> = {};
    if (typeof data.notes !== 'undefined') staffUpdates.notes = data.notes;
    if (Object.keys(staffUpdates).length) await this.repo.update({ id }, staffUpdates);
    if (data.firstName || data.lastName || data.phone || data.gender || data.dateOfBirth) {
      const staff = await this.repo.findOne({ where: { id }, relations: ['user'] });
      if (staff?.user?.id) {
        await this.userRepo.update({ id: staff.user.id }, {
          firstName: data.firstName ?? staff.user.firstName ?? null,
          lastName: data.lastName ?? staff.user.lastName ?? null,
          phone: data.phone ?? staff.user.phone ?? null,
          gender: data.gender ?? staff.user.gender ?? null,
          dateOfBirth: data.dateOfBirth ?? staff.user.dateOfBirth ?? null,
        } as Partial<User>);
      }
    }
    return this.findOne(id);
  }

  getTimings(staffId: string) { return this.timingsRepo.find({ where: { staff: { id: staffId } as any } }); }

  async upsertTimings(staffId: string, entries: Partial<Timings>[]) {
    // naive: delete existing, insert new
    await this.timingsRepo.delete({ staff: { id: staffId } as any });
    const toSave = entries.map((e) => this.timingsRepo.create({ ...e, staff: { id: staffId } as any }));
    return this.timingsRepo.save(toSave);
  }

  addLeave(staffId: string, leave: Partial<Leave>) {
    return this.leaveRepo.save(this.leaveRepo.create({ ...leave, staff: { id: staffId } as any }));
  }

  // Timings CRUD
  createTiming(staffId: string, timing: Partial<Timings>) {
    return this.timingsRepo.save(this.timingsRepo.create({ ...timing, staff: { id: staffId } as any }));
  }

  getTimingById(staffId: string, timingId: string) {
    return this.timingsRepo.findOne({ where: { id: timingId, staff: { id: staffId } as any } as any });
  }

  async updateTiming(staffId: string, timingId: string, data: Partial<Timings>) {
    await this.timingsRepo.createQueryBuilder()
      .update(Timings)
      .set(data)
      .where('id = :id AND staffId = :sid', { id: timingId, sid: staffId })
      .execute();
    return this.getTimingById(staffId, timingId);
  }

  async deleteTiming(staffId: string, timingId: string) {
    await this.timingsRepo.createQueryBuilder()
      .delete()
      .from(Timings)
      .where('id = :id AND staffId = :sid', { id: timingId, sid: staffId })
      .execute();
    return { id: timingId, removed: true } as any;
  }

  // Leaves CRUD
  listLeaves(staffId: string) {
    return this.leaveRepo.find({ where: { staff: { id: staffId } as any } });
  }

  getLeaveById(staffId: string, leaveId: string) {
    return this.leaveRepo.findOne({ where: { id: leaveId, staff: { id: staffId } as any } as any });
  }

  async updateLeave(staffId: string, leaveId: string, data: Partial<Leave>) {
    await this.leaveRepo.createQueryBuilder()
      .update(Leave)
      .set(data)
      .where('id = :id AND staffId = :sid', { id: leaveId, sid: staffId })
      .execute();
    return this.getLeaveById(staffId, leaveId);
  }

  async deleteLeave(staffId: string, leaveId: string) {
    await this.leaveRepo.createQueryBuilder()
      .delete()
      .from(Leave)
      .where('id = :id AND staffId = :sid', { id: leaveId, sid: staffId })
      .execute();
    return { id: leaveId, removed: true } as any;
  }
}
