import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, Not, Repository } from 'typeorm';
import { Appointment, AppointmentStatus } from '../../entities/appointment.entity';
import { Staff } from '../../entities/staff.entity';
import { Timings } from '../../entities/timings.entity';
import { Leave } from '../../entities/leave.entity';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment) private repo: Repository<Appointment>,
    @InjectRepository(Staff) private staffRepo: Repository<Staff>,
    @InjectRepository(Timings) private timingsRepo: Repository<Timings>,
    @InjectRepository(Leave) private leaveRepo: Repository<Leave>,
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

  async findMatchingDoctorsForIssues(payload: { issues?: string[]; specialty_ids?: string[]; timeWindow?: any; appointment_type?: string }) {
    const issues = Array.isArray(payload?.issues) ? payload!.issues : [];
    const specs = Array.isArray(payload?.specialty_ids) ? payload!.specialty_ids : [];
    if (!issues.length && !specs.length) return [];

    // Query doctors linked to specialties derived from issues and/or provided specialties.
    // Only active doctors; prefer primary mappings.
    const rows = await this.repo.query(
      `WITH spec_from_issues AS (
         SELECT DISTINCT i.mapped_specialty_id AS sid FROM issue i WHERE i.id = ANY($1::uuid[])
       ), spec_union AS (
         SELECT sid FROM spec_from_issues WHERE sid IS NOT NULL
         UNION
         SELECT UNNEST($2::uuid[])
       )
       SELECT DISTINCT ss.staff_id as "doctorId"
       FROM staff_specialty ss
       JOIN staff s ON s.id = ss.staff_id
       WHERE ss.specialty_id IN (SELECT sid FROM spec_union)
         AND s.role = 'doctor' AND s.status = 'active'
       ORDER BY MAX(CASE WHEN ss.primary THEN 1 ELSE 0 END) DESC`,
      [issues, specs],
    );
    return rows.map((r: any) => r.doctorId);
  }

  async getDoctorNext3Slots(doctorId: string) {
    const targetCount = 3;
    const results: Array<{ startDatetime: Date; endDatetime: Date; slotDurationMinutes: number }>= [];
    const now = new Date();

    // Load timings for this doctor
    const timings = await this.timingsRepo.find({ where: { staff: { id: doctorId } as any, isAvailable: true } });
    if (!timings.length) return results;

    // Helper: convert weekday 0-6 to next date occurrences up to 30 days
    const maxDays = 30;
    let dayCursor = 0;
    while (results.length < targetCount && dayCursor < maxDays) {
      const date = new Date(now);
      date.setHours(0, 0, 0, 0);
      date.setDate(now.getDate() + dayCursor);
      const weekday = date.getDay(); // 0=Sunday

      const dayTimings = timings.filter((t) => t.weekday === weekday);
      for (const t of dayTimings) {
        const slotDuration = t.slotDurationMinutes || 15;
        const dayStart = this.combineDateTime(date, t.startTime);
        const dayEnd = this.combineDateTime(date, t.endTime);
        // If today, move start forward to now
        let slotStart = new Date(Math.max(dayStart.getTime(), now.getTime()));
        // Align to next slot boundary
        slotStart = this.alignToSlot(slotStart, dayStart, slotDuration);

        while (slotStart < dayEnd && results.length < targetCount) {
          const slotEnd = new Date(slotStart.getTime() + slotDuration * 60000);
          if (slotEnd > dayEnd) break;
          const available = await this.isSlotAvailable(doctorId, slotStart, slotEnd);
          if (available) {
            results.push({ startDatetime: new Date(slotStart), endDatetime: new Date(slotEnd), slotDurationMinutes: slotDuration });
          }
          slotStart = new Date(slotStart.getTime() + slotDuration * 60000);
        }
        if (results.length >= targetCount) break;
      }
      dayCursor += 1;
    }

    return results;
  }

  private combineDateTime(date: Date, timeStr: string): Date {
    // timeStr expected HH:MM or HH:MM:SS
    const [h, m, s] = timeStr.split(':').map((v) => parseInt(v || '0', 10));
    const d = new Date(date);
    d.setHours(h || 0, m || 0, s || 0, 0);
    return d;
  }

  private alignToSlot(current: Date, dayStart: Date, minutes: number): Date {
    const offset = current.getTime() - dayStart.getTime();
    const step = minutes * 60000;
    const aligned = Math.ceil(offset / step) * step + dayStart.getTime();
    return new Date(aligned);
  }

  private async isSlotAvailable(doctorId: string, start: Date, end: Date): Promise<boolean> {
    // Leaves overlap if start < leave.end AND end > leave.start
    const leaveOverlap = await this.leaveRepo.createQueryBuilder('l')
      .where('l.staff_id = :did', { did: doctorId })
      .andWhere('l.start_datetime < :end', { end })
      .andWhere('l.end_datetime > :start', { start })
      .getCount();
    if (leaveOverlap > 0) return false;

    // Appointments overlap if start < appt.end AND end > appt.start and status not cancelled/no_show
    const busyStatuses: AppointmentStatus[] = [
      AppointmentStatus.Pending,
      AppointmentStatus.Confirmed,
      AppointmentStatus.CheckedIn,
      AppointmentStatus.InProgress,
      AppointmentStatus.Completed,
    ];
    const apptOverlap = await this.repo.createQueryBuilder('a')
      .where('a.doctor_id = :did', { did: doctorId })
      .andWhere('a.status IN (:...st)', { st: busyStatuses })
      .andWhere('a.scheduled_start < :end', { end })
      .andWhere('a.scheduled_end > :start', { start })
      .getCount();
    return apptOverlap === 0;
  }

  async book(data: Partial<Appointment>) {
    if (!data?.doctor || !data?.patient || !data?.scheduledStart || !data?.scheduledEnd) {
      throw new Error('Missing required fields: doctor, patient, scheduledStart, scheduledEnd');
    }
    const doctorId = (data.doctor as any)?.id || (data as any)?.doctorId;
    const start = new Date(data.scheduledStart as any);
    const end = new Date(data.scheduledEnd as any);
    const available = await this.isSlotAvailable(doctorId, start, end);
    if (!available) {
      throw new Error('Selected slot is no longer available');
    }
    return this.create({ ...data, status: AppointmentStatus.Confirmed });
  }

  async update(id: string, data: Partial<Appointment>) { await this.repo.update({ id }, data); return this.findOne(id); }
  async cancel(id: string, reason?: string) {
    await this.repo.update({ id }, { status: AppointmentStatus.Cancelled, isDeleted: true, cancelReason: reason ?? null });
    return { id, status: AppointmentStatus.Cancelled, cancelReason: reason ?? null } as any;
  }

  async remove(id: string) {
    await this.repo.delete({ id });
    return { id, removed: true } as any;
  }

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
