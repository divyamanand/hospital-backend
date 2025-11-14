import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from '../../entities/appointment.entity';
import { Staff } from '../../entities/staff.entity';
import { Timings } from '../../entities/timings.entity';
import { Leave } from '../../entities/leave.entity';
import { Specialty } from '../../entities/specialty.entity';
import { LlmService } from '../llm/llm.service';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment) private repo: Repository<Appointment>,
    @InjectRepository(Staff) private staffRepo: Repository<Staff>,
    @InjectRepository(Timings) private timingsRepo: Repository<Timings>,
    @InjectRepository(Leave) private leaveRepo: Repository<Leave>,
    @InjectRepository(Specialty) private specialtyRepo: Repository<Specialty>,
    private llmService: LlmService,
  ) {}
  create(data: Partial<Appointment>) { return this.repo.save(this.repo.create(data)); }
  findAll(filter?: any) {
    const qb = this.repo.createQueryBuilder('a').leftJoinAndSelect('a.patient','patient').leftJoinAndSelect('a.doctor','doctor');
    qb.where('1=1');
    if (filter?.patientId) qb.andWhere('a.patientId = :pid', { pid: filter.patientId });
    if (filter?.doctorId) qb.andWhere('a.doctorId = :did', { did: filter.doctorId });
    if (filter?.status) qb.andWhere('a.status = :st', { st: filter.status });
    if (filter?.from) qb.andWhere('a.startAt >= :from', { from: filter.from });
    if (filter?.to) qb.andWhere('a.startAt <= :to', { to: filter.to });
    return qb.getMany();
  }
  findOne(id: string) { return this.repo.findOne({ where: { id }, relations: ['patient','doctor'] }); }

  async findMatchingDoctorsForIssues(payload: { issues?: string[]; specialty_ids?: string[]; timeWindow?: any; appointment_type?: string }) {
    const issues = Array.isArray(payload?.issues) ? payload!.issues : [];
    const specIds = Array.isArray(payload?.specialty_ids) ? payload!.specialty_ids : [];
    if (!issues.length && !specIds.length) return [];

    // Load specialties from DB (either provided ids or all)
    let specialties = [] as { id: string; name: string }[];
    if (specIds.length) {
      specialties = await this.specialtyRepo
        .createQueryBuilder('s')
        .where('s.id IN (:...ids)', { ids: specIds })
        .getMany();
    } else {
      specialties = await this.specialtyRepo.createQueryBuilder('s').select(['s.id', 's.name']).getMany();
    }

    // Ask the LLM to infer which specialties are required for the provided issues
    const inferred = await this.llmService.inferSpecialties(issues, specialties as any);
    if (!inferred || !inferred.length) return [];

    // Fetch doctors and their specialties
    const rows = await this.repo.query(
      `SELECT s.id as "doctorId", json_agg(json_build_object('id', sp.id, 'name', sp.name) ORDER BY ss.primary DESC) as specialties
       FROM staff s
       JOIN staff_specialty ss ON ss.staffId = s.id
       JOIN specialty sp ON sp.id = ss.specialtyId
       WHERE s.role = 'doctor'
       GROUP BY s.id`,
      [],
    );

    // Score doctors by how many of the inferred specialties they cover
    const lowerInferred = inferred.map((x) => x.toLowerCase());
    const results: Array<{ doctorId: string; score: number; specialties: Array<{ id: string; name: string }> }> = [];
    for (const r of rows) {
      const specs: Array<{ id: string; name: string }> = r.specialties || [];
      const names = specs.map((s) => (s.name || '').toLowerCase());
      const matched = lowerInferred.filter((inf) => names.includes(inf));
      const score = lowerInferred.length ? matched.length / lowerInferred.length : 0;
      if (score > 0) results.push({ doctorId: r.doctorId, score, specialties: specs });
    }

    // Sort by score desc and return
    return results.sort((a, b) => b.score - a.score).map((x) => ({ doctorId: x.doctorId, score: x.score, specialties: x.specialties }));
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
        const slotDuration = 15;
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
      .where('l.staffId = :did', { did: doctorId })
      .andWhere('l.startDate <= :endDate', { endDate: end.toISOString().slice(0,10) })
      .andWhere('l.endDate >= :startDate', { startDate: start.toISOString().slice(0,10) })
      .getCount();
    if (leaveOverlap > 0) return false;

    // Appointments overlap if start < appt.end AND end > appt.start and status not cancelled/no_show
    const busyStatuses: string[] = ['scheduled','confirmed','checkedIn','completed'];
    const apptOverlap = await this.repo.createQueryBuilder('a')
      .where('a.doctorId = :did', { did: doctorId })
      .andWhere('a.status IN (:...st)', { st: busyStatuses })
      .andWhere('a.startAt < :end', { end })
      .andWhere('a.endAt > :start', { start })
      .getCount();
    return apptOverlap === 0;
  }

  async book(data: Partial<Appointment>) {
    if (!data?.doctor || !data?.patient || !data?.startAt || !data?.endAt) {
      throw new Error('Missing required fields: doctor, patient, startAt, endAt');
    }
    const doctorId = (data.doctor as any)?.id || (data as any)?.doctorId;
    const start = new Date(data.startAt as any);
    const end = new Date(data.endAt as any);
    const available = await this.isSlotAvailable(doctorId, start, end);
    if (!available) {
      throw new Error('Selected slot is no longer available');
    }
    return this.create({ ...data, status: 'confirmed' as any });
  }

  async update(id: string, data: Partial<Appointment>) { await this.repo.update({ id }, data); return this.findOne(id); }
  async cancel(id: string, reason?: string) {
    await this.repo.update({ id }, { status: 'cancelled' as any, cancelReason: reason ?? null });
    return { id, status: 'cancelled', cancelReason: reason ?? null } as any;
  }

  async remove(id: string) {
    await this.repo.delete({ id });
    return { id, removed: true } as any;
  }

  async transition(id: string, action: 'confirm'|'checkin'|'complete') {
    const statusMap: Record<'confirm'|'checkin'|'complete', any> = {
      confirm: 'confirmed',
      checkin: 'checkedIn',
      complete: 'completed',
    } as any;
    const next = statusMap[action];
    await this.repo.update({ id }, { status: next as any });
    return this.findOne(id);
  }
}
