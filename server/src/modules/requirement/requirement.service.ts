import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Requirement, RequirementStatus, RequirementType } from '../../entities/requirement.entity';
import { RequirementFulfillment } from '../../entities/requirement-fulfillment.entity';
import { Staff, StaffStatus } from '../../entities/staff.entity';
import { Timings } from '../../entities/timings.entity';
import { Leave } from '../../entities/leave.entity';
import { Appointment, AppointmentStatus } from '../../entities/appointment.entity';
import { ItemRequirement } from '../../entities/item-requirement.entity';
import { StaffRequirement } from '../../entities/staff-requirement.entity';
import { RoomRequirement } from '../../entities/room-requirement.entity';
import { Patient } from '../../entities/patient.entity';
import { User } from '../../entities/user.entity';

@Injectable()
export class RequirementService {
  constructor(
    @InjectRepository(Requirement) private reqRepo: Repository<Requirement>,
    @InjectRepository(RequirementFulfillment) private fulRepo: Repository<RequirementFulfillment>,
    @InjectRepository(Staff) private staffRepo: Repository<Staff>,
    @InjectRepository(Timings) private timingsRepo: Repository<Timings>,
    @InjectRepository(Leave) private leaveRepo: Repository<Leave>,
    @InjectRepository(Appointment) private apptRepo: Repository<Appointment>,
    @InjectRepository(ItemRequirement) private itemReqRepo: Repository<ItemRequirement>,
    @InjectRepository(StaffRequirement) private staffReqRepo: Repository<StaffRequirement>,
    @InjectRepository(RoomRequirement) private roomReqRepo: Repository<RoomRequirement>,
    @InjectRepository(Patient) private patientRepo: Repository<Patient>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  create(data: Partial<Requirement>) { return this.reqRepo.save(this.reqRepo.create(data)); }
  findByAppointment(appointmentId: string) { return this.reqRepo.find({ where: { appointment: { id: appointmentId } as any } }); }
  async fulfill(id: string, body: Partial<RequirementFulfillment>) {
    const fulfillment = await this.fulRepo.save(this.fulRepo.create({ ...body, requirement: { id } as any }));
    await this.reqRepo.update({ id }, { status: 'fulfilled' as any });
    return fulfillment;
  }

  // Find staff candidates for a requirement
  async findStaffForRequirement(requirementId: string) {
    const req = await this.reqRepo.findOne({ where: { id: requirementId }, relations: ['appointment'] });
    if (!req) return [];
    if (req.type !== RequirementType.Staff) return [];

    // Interpret relatedEntityId as a StaffRole string for now
    const role = (req.relatedEntityId as any) as StaffRole;
    const appt = await this.apptRepo.findOne({ where: { id: (req.appointment as any)?.id } });

    const candidates = await this.staffRepo.find({ where: { role: role as any, status: StaffStatus.Active } as any });
    if (!appt) return candidates;

    // Filter by availability around appointment window if set
    const start = appt.scheduledStart ? new Date(appt.scheduledStart) : null;
    const end = appt.scheduledEnd ? new Date(appt.scheduledEnd) : null;
    if (!start || !end) return candidates;

    const available: Staff[] = [];
    for (const s of candidates) {
      const isAvail = await this.isStaffAvailable(s.id, start, end);
      if (isAvail) available.push(s);
    }
    return available;
  }

  // Allot a specific staff to this requirement (create fulfillment records up to quantity)
  async allotStaff(requirementId: string, staffIds: string[], notes?: string) {
    const req = await this.reqRepo.findOne({ where: { id: requirementId } });
    if (!req) return null;
    const take = Math.min(req.quantity || 1, staffIds.length);
    const now = new Date();
    const created: RequirementFulfillment[] = [] as any;
    for (let i = 0; i < take; i++) {
      const ff = await this.fulRepo.save(this.fulRepo.create({ requirement: { id: requirementId } as any, fulfilledById: staffIds[i], fulfilledAt: now, notes: notes || null }));
      created.push(ff);
    }
    // mark fulfilled if we reached quantity
    const count = await this.fulRepo.count({ where: { requirement: { id: requirementId } as any } as any });
    if (count >= (req.quantity || 1)) {
      await this.reqRepo.update({ id: requirementId }, { status: RequirementStatus.Fulfilled });
    }
    return created;
  }

  // Allotment CRUD
  listAllotments(requirementId: string) {
    return this.fulRepo.find({ where: { requirement: { id: requirementId } as any } as any });
  }

  getAllotment(id: string) { return this.fulRepo.findOne({ where: { id } }); }

  async updateAllotment(id: string, data: Partial<RequirementFulfillment>) {
    await this.fulRepo.update({ id }, data);
    return this.getAllotment(id);
  }

  async deleteAllotment(id: string) {
    const ff = await this.fulRepo.findOne({ where: { id }, relations: ['requirement'] });
    if (!ff) return { id, removed: false } as any;
    const reqId = (ff.requirement as any)?.id;
    await this.fulRepo.delete({ id });
    if (reqId) {
      const req = await this.reqRepo.findOne({ where: { id: reqId } });
      const count = await this.fulRepo.count({ where: { requirement: { id: reqId } as any } as any });
      if (req && count < (req.quantity || 1)) {
        await this.reqRepo.update({ id: reqId }, { status: RequirementStatus.Pending });
      }
    }
    return { id, removed: true } as any;
  }

  // Hook: re-run matching on requirement update
  async updateRequirement(id: string, data: Partial<Requirement>) {
    await this.reqRepo.update({ id }, data);
    // For staff requirements, compute and attach suggestions (no persistence, returned to client)
    const req = await this.reqRepo.findOne({ where: { id }, relations: ['appointment'] });
    const suggestions = req?.type === RequirementType.Staff ? await this.findStaffForRequirement(id) : [];
    return { requirement: req, suggestions };
  }

  private async isStaffAvailable(staffId: string, start: Date, end: Date): Promise<boolean> {
    // Check leaves
    const leaveOverlap = await this.leaveRepo.createQueryBuilder('l')
      .where('l.staff_id = :sid', { sid: staffId })
      .andWhere('l.start_datetime < :end', { end })
      .andWhere('l.end_datetime > :start', { start })
      .getCount();
    if (leaveOverlap > 0) return false;

    // Check existing appointments (busy statuses)
    const busyStatuses: AppointmentStatus[] = [
      AppointmentStatus.Pending,
      AppointmentStatus.Confirmed,
      AppointmentStatus.CheckedIn,
      AppointmentStatus.InProgress,
      AppointmentStatus.Completed,
    ];
    const apptOverlap = await this.apptRepo.createQueryBuilder('a')
      .where('a.doctor_id = :sid', { sid: staffId })
      .andWhere('a.status IN (:...st)', { st: busyStatuses })
      .andWhere('a.scheduled_start < :end', { end })
      .andWhere('a.scheduled_end > :start', { start })
      .getCount();
    if (apptOverlap > 0) return false;

    // Check timings window contains the slot
    const weekday = start.getDay();
    const tlist = await this.timingsRepo.find({ where: { staff: { id: staffId } as any, weekday, isAvailable: true } });
    if (!tlist.length) return false;
    const within = tlist.some((t) => this.withinTiming(start, end, t));
    return within;
  }

  private withinTiming(start: Date, end: Date, t: Timings): boolean {
    const day = new Date(start);
    day.setHours(0,0,0,0);
    const s = this.combine(day, t.startTime);
    const e = this.combine(day, t.endTime);
    return start >= s && end <= e;
  }

  private combine(date: Date, timeStr: string) {
    const [h,m,s] = timeStr.split(':').map((v)=>parseInt(v||'0',10));
    const d = new Date(date);
    d.setHours(h||0,m||0,s||0,0);
    return d;
  }

  // New: helpers and CRUD for item/staff/room requirement using primaryUserId
  async resolvePrimaryUserId(actor: { userType?: string; role?: string; id: string }): Promise<string | null> {
    if (!actor?.id) return null;
    if (actor.userType === 'staff') {
      const s = await this.staffRepo.findOne({ where: { id: actor.id }, relations: ['user'] });
      return s?.user?.id || null;
    }
    if (actor.userType === 'patient') {
      const p = await this.patientRepo.findOne({ where: { id: actor.id }, relations: ['user'] });
      return p?.user?.id || null;
    }
    return null;
  }

  // Item Requirement
  createItemRequirement(data: Partial<ItemRequirement>) { return this.itemReqRepo.save(this.itemReqRepo.create(data)); }
  listItemRequirements(filter?: { primaryUserId?: string }) {
    const where: any = {};
    if (filter?.primaryUserId) where.primaryUserId = filter.primaryUserId;
    return this.itemReqRepo.find({ where });
  }
  getItemRequirement(id: string) { return this.itemReqRepo.findOne({ where: { id } }); }
  async updateItemRequirement(id: string, data: Partial<ItemRequirement>) { await this.itemReqRepo.update({ id }, data); return this.getItemRequirement(id); }
  async deleteItemRequirement(id: string) { await this.itemReqRepo.delete({ id }); return { id, deleted: true } as any; }

  // Staff Requirement
  createStaffRequirement(data: Partial<StaffRequirement>) { return this.staffReqRepo.save(this.staffReqRepo.create(data)); }
  listStaffRequirements(filter?: { primaryUserId?: string }) {
    const where: any = {};
    if (filter?.primaryUserId) where.primaryUserId = filter.primaryUserId;
    return this.staffReqRepo.find({ where });
  }
  getStaffRequirement(id: string) { return this.staffReqRepo.findOne({ where: { id } }); }
  async updateStaffRequirement(id: string, data: Partial<StaffRequirement>) { await this.staffReqRepo.update({ id }, data); return this.getStaffRequirement(id); }
  async deleteStaffRequirement(id: string) { await this.staffReqRepo.delete({ id }); return { id, deleted: true } as any; }

  // Room Requirement
  createRoomRequirement(data: Partial<RoomRequirement>) { return this.roomReqRepo.save(this.roomReqRepo.create(data)); }
  listRoomRequirements(filter?: { primaryUserId?: string }) {
    const where: any = {};
    if (filter?.primaryUserId) where.primaryUserId = filter.primaryUserId;
    return this.roomReqRepo.find({ where });
  }
  getRoomRequirement(id: string) { return this.roomReqRepo.findOne({ where: { id } }); }
  async updateRoomRequirement(id: string, data: Partial<RoomRequirement>) { await this.roomReqRepo.update({ id }, data); return this.getRoomRequirement(id); }
  async deleteRoomRequirement(id: string) { await this.roomReqRepo.delete({ id }); return { id, deleted: true } as any; }
}
