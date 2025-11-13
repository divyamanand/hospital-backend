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
}
