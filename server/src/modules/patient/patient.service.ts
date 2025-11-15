import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from '../../entities/patient.entity';
import { User, UserRole, UserType } from '../../entities/user.entity';
import { Appointment } from '../../entities/appointment.entity';
import { Prescription } from '../../entities/prescription.entity';
import * as bcrypt from 'bcryptjs';

function calcAgeYears(dob: Date): number {
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const mDiff = now.getMonth() - dob.getMonth();
  if (mDiff < 0 || (mDiff === 0 && now.getDate() < dob.getDate())) age--;
  return age;
}

@Injectable()
export class PatientService {
  constructor(
    @InjectRepository(Patient) private repo: Repository<Patient>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Appointment) private apptRepo: Repository<Appointment>,
    @InjectRepository(Prescription) private presRepo: Repository<Prescription>,
  ) {}

  async create(data: any) {
    const { email, password, firstName, lastName, dateOfBirth, gender, phone, primaryPhysicianId } = data || {};
    if (email && password) {
      const exists = await this.userRepo.findOne({ where: { email } });
      if (exists) throw new Error('Email already in use');
      const passwordHash = await bcrypt.hash(password, 10);
      const user = await this.userRepo.save(this.userRepo.create({
        email,
        passwordHash,
        role: UserRole.Patient,
        type: UserType.Patient,
        firstName: firstName ?? null,
        lastName: lastName ?? null,
        dateOfBirth: dateOfBirth ?? null,
        gender: gender ?? null,
        phone: phone ?? null,
      } as Partial<User>));
      const patient = this.repo.create({ user: { id: user.id } as any, primaryPhysician: primaryPhysicianId ? ({ id: primaryPhysicianId } as any) : null });
      return this.repo.save(patient);
    }
    // Create patient profile only; invite later to set password
    const patient = this.repo.create({ primaryPhysician: primaryPhysicianId ? ({ id: primaryPhysicianId } as any) : null });
    return this.repo.save(patient);
  }
  async findAll(filter?: any) {
    let rows = await this.repo.find({ relations: ['user','primaryPhysician'] });
    if (!filter) return rows;
    if (filter.gender) rows = rows.filter(r => r.user?.gender === filter.gender);
    if (filter.minAge || filter.maxAge) {
      rows = rows.filter(r => {
        const dob = r.user?.dateOfBirth ? new Date(r.user.dateOfBirth) : null;
        if (!dob) return false; // exclude if no DOB when filtering by age
        const age = calcAgeYears(dob);
        if (filter.minAge && age < filter.minAge) return false;
        if (filter.maxAge && age > filter.maxAge) return false;
        return true;
      });
    }
    return rows;
  }
  
  async findAllSummaries(filter?: any) {
    const rows = await this.findAll(filter);
    if (!rows.length) return [] as any[];
    const ids = rows.map((r) => r.id);

    const apptCountsRaw = await this.apptRepo.createQueryBuilder('a')
      .select('a.patientId', 'patientId')
      .addSelect('COUNT(*)', 'count')
      .where('a.patientId IN (:...ids)', { ids })
      .groupBy('a.patientId')
      .getRawMany();
    const presCountsRaw = await this.presRepo.createQueryBuilder('p')
      .select('p.patientId', 'patientId')
      .addSelect('COUNT(*)', 'count')
      .where('p.patientId IN (:...ids)', { ids })
      .groupBy('p.patientId')
      .getRawMany();
    const apptMap = new Map(apptCountsRaw.map((r: any) => [r.patientId, parseInt(r.count, 10)]));
    const presMap = new Map(presCountsRaw.map((r: any) => [r.patientId, parseInt(r.count, 10)]));

    return rows.map((r) => {
      const firstName = r.user?.firstName || '';
      const lastName = r.user?.lastName || '';
      const name = [firstName, lastName].join(' ').trim() || null;
      const dob = r.user?.dateOfBirth ? new Date(r.user.dateOfBirth) : null;
      const age = dob ? calcAgeYears(dob) : null;
      const gender = r.user?.gender || null;
      return {
        id: r.id,
        name,
        dateOfBirth: r.user?.dateOfBirth || null,
        gender,
        age,
        createdAt: r.createdAt,
        appointmentsCount: apptMap.get(r.id) || 0,
        prescriptionsCount: presMap.get(r.id) || 0,
      };
    });
  }
  findOne(id: string) { return this.repo.findOne({ where: { id }, relations: ['user','primaryPhysician'] }); }

  async update(id: string, data: Partial<Patient>) {
    await this.repo.update({ id }, data);
    return this.findOne(id);
  }

  async getDoctorsFromPrescriptions(patientId: string) {
    const rows = await this.repo.query(
      `SELECT DISTINCT p.doctorId as "doctorId" FROM prescription p WHERE p.patientId = $1 AND p.doctorId IS NOT NULL`,
      [patientId],
    );
    return rows.map((r: any) => r.doctorId);
  }

  async isDoctorLinkedToPatient(doctorId: string, patientId: string): Promise<boolean> {
    if (!doctorId || !patientId) return false;
    const appt = await this.repo.query(
      'SELECT 1 FROM appointment WHERE patientId = $1 AND doctorId = $2 LIMIT 1',
      [patientId, doctorId],
    );
    if (appt.length > 0) return true;
    const rx = await this.repo.query(
      'SELECT 1 FROM prescription WHERE patientId = $1 AND doctorId = $2 LIMIT 1',
      [patientId, doctorId],
    );
    return rx.length > 0;
  }

  async getAppointmentsForPatient(patientId: string) {
    const qb = this.apptRepo
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.patient', 'patient')
      .leftJoinAndSelect('a.doctor', 'doctor')
      .where('a.patientId = :pid', { pid: patientId })
      .orderBy('a.startAt', 'DESC');
    return qb.getMany();
  }

  async getPrescriptionsForPatient(patientId: string) {
    const qb = this.presRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.patient', 'patient')
      .leftJoinAndSelect('p.doctor', 'doctor')
      .leftJoinAndSelect('p.items', 'items')
      .where('p.patientId = :pid', { pid: patientId })
      .orderBy('p.createdAt', 'DESC');
    return qb.getMany();
  }
}
