import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Leave } from '../../entities/leave.entity';
import { Staff } from '../../entities/staff.entity';

@Injectable()
export class LeaveService {
  constructor(
    @InjectRepository(Leave) private leaveRepo: Repository<Leave>,
    @InjectRepository(Staff) private staffRepo: Repository<Staff>,
  ) {}

  async create(data: any) {
    const { staffId, startDate, endDate, reason } = data || {};
    if (!staffId || !startDate || !endDate) throw new BadRequestException('staffId,startDate,endDate required');
    const staff = await this.staffRepo.findOne({ where: { id: staffId } });
    if (!staff) throw new BadRequestException('Invalid staffId');
    const leave = this.leaveRepo.create({ staff: { id: staffId } as any, startDate, endDate, reason: reason ?? null, status: 'pending' as any });
    return this.leaveRepo.save(leave);
  }

  async list(filter?: any) {
    const qb = this.leaveRepo.createQueryBuilder('l').leftJoinAndSelect('l.staff','staff');
    qb.where('1=1');
    if (filter?.staffId) qb.andWhere('l.staffId = :sid', { sid: filter.staffId });
    if (filter?.status) qb.andWhere('l.status = :st', { st: filter.status });
    if (filter?.from) qb.andWhere('l.startDate >= :from', { from: filter.from });
    if (filter?.to) qb.andWhere('l.endDate <= :to', { to: filter.to });
    if (filter?.active === true) {
      const today = new Date().toISOString().slice(0,10);
      qb.andWhere(':today BETWEEN l.startDate AND l.endDate', { today });
    }
    return qb.getMany();
  }

  findOne(id: string) { return this.leaveRepo.findOne({ where: { id }, relations: ['staff'] }); }

  async update(id: string, data: any) {
    await this.leaveRepo.update({ id }, data);
    return this.findOne(id);
  }

  async transition(id: string, action: 'approve'|'reject'|'cancel', reason?: string) {
    const leave = await this.findOne(id);
    if (!leave) throw new BadRequestException('leave not found');
    const statusMap: any = { approve: 'approved', reject: 'rejected', cancel: 'cancelled' };
    const next = statusMap[action];
    if (!next) throw new BadRequestException('invalid action');
    await this.leaveRepo.update({ id }, { status: next, notes: reason ?? leave.notes ?? null });
    return this.findOne(id);
  }
}
