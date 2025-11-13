import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Staff } from '../../entities/staff.entity';
import { Timings } from '../../entities/timings.entity';
import { Leave } from '../../entities/leave.entity';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(Staff) private repo: Repository<Staff>,
    @InjectRepository(Timings) private timingsRepo: Repository<Timings>,
    @InjectRepository(Leave) private leaveRepo: Repository<Leave>,
  ) {}
  create(data: Partial<Staff>) { return this.repo.save(this.repo.create(data)); }
  findAll() { return this.repo.find(); }
  findOne(id: string) { return this.repo.findOne({ where: { id } }); }
  async update(id: string, data: Partial<Staff>) { await this.repo.update({ id }, data); return this.findOne(id); }

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
      .where('id = :id AND staff_id = :sid', { id: timingId, sid: staffId })
      .execute();
    return this.getTimingById(staffId, timingId);
  }

  async deleteTiming(staffId: string, timingId: string) {
    await this.timingsRepo.createQueryBuilder()
      .delete()
      .from(Timings)
      .where('id = :id AND staff_id = :sid', { id: timingId, sid: staffId })
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
      .where('id = :id AND staff_id = :sid', { id: leaveId, sid: staffId })
      .execute();
    return this.getLeaveById(staffId, leaveId);
  }

  async deleteLeave(staffId: string, leaveId: string) {
    await this.leaveRepo.createQueryBuilder()
      .delete()
      .from(Leave)
      .where('id = :id AND staff_id = :sid', { id: leaveId, sid: staffId })
      .execute();
    return { id: leaveId, removed: true } as any;
  }
}
