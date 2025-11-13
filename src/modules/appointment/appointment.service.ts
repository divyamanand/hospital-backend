import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment, AppointmentStatus } from '../../entities/appointment.entity';
import { Staff } from '../../entities/staff.entity';
import { Timings } from '../../entities/timings.entity';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment) private repo: Repository<Appointment>,
    @InjectRepository(Staff) private staffRepo: Repository<Staff>,
    @InjectRepository(Timings) private timingsRepo: Repository<Timings>,
  ) {}
  create(data: Partial<Appointment>) { return this.repo.save(this.repo.create(data)); }
  findAll(filter?: any) {
    const where: any = {};
    if (filter?.patient_id) where.patient = { id: filter.patient_id } as any;
    if (filter?.doctor_id) where.doctor = { id: filter.doctor_id } as any;
    if (filter?.status) where.status = filter.status;
    // date filter basic: scheduledStart >= from and <= to
    const qb = this.repo.createQueryBuilder('a').leftJoinAndSelect('a.patient','patient').leftJoinAndSelect('a.doctor','doctor');
    qb.where('1=1');
    if (filter?.patient_id) qb.andWhere('a.patient_id = :pid', { pid: filter.patient_id });
    if (filter?.doctor_id) qb.andWhere('a.doctor_id = :did', { did: filter.doctor_id });
    if (filter?.status) qb.andWhere('a.status = :st', { st: filter.status });
    if (filter?.from) qb.andWhere('a.scheduled_start >= :from', { from: filter.from });
    if (filter?.to) qb.andWhere('a.scheduled_start <= :to', { to: filter.to });
    return qb.getMany();
  }
  findOne(id: string) { return this.repo.findOne({ where: { id }, relations: ['patient','doctor','specialty','room','requestedIssue'] }); }

  async findMatchingDoctorsForIssues(payload: { issues: string[] }) {
    if (!payload?.issues?.length) return [];
    // doctors mapped to specialties of the given issues
    const rows = await this.repo.query(
      `SELECT DISTINCT ss.staff_id as "doctorId"
       FROM issue i
       JOIN staff_specialty ss ON ss.specialty_id = i.mapped_specialty_id
       WHERE i.id = ANY($1::uuid[])`,
      [payload.issues],
    );
    return rows.map((r: any) => r.doctorId);
  }

  async getDoctorNext3Slots(doctorId: string) {
    // naive placeholder: return three arbitrary upcoming 30-min slots today at 09:00/09:30/10:00
    const base = new Date(); base.setMinutes(0,0,0); base.setHours(9);
    const slots = [0,30,60].map((m) => {
      const start = new Date(base.getTime() + m*60000);
      const end = new Date(start.getTime() + 30*60000);
      return { start, end };
    });
    return slots;
  }

  async book(data: Partial<Appointment>) {
    return this.create({ ...data, status: AppointmentStatus.Confirmed });
  }

  async update(id: string, data: Partial<Appointment>) { await this.repo.update({ id }, data); return this.findOne(id); }
  async cancel(id: string) { await this.repo.update({ id }, { status: AppointmentStatus.Cancelled, isDeleted: true }); return { id, status: AppointmentStatus.Cancelled }; }

  async transition(id: string, action: 'confirm'|'checkin'|'complete') {
    const statusMap: Record<typeof action, AppointmentStatus> = {
      confirm: AppointmentStatus.Confirmed,
      checkin: AppointmentStatus.CheckedIn,
      complete: AppointmentStatus.Completed,
    } as any;
    const next = statusMap[action];
    await this.repo.update({ id }, { status: next });
    return this.findOne(id);
  }
}
