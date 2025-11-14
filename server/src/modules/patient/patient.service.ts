import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from '../../entities/patient.entity';
import { User, UserRole } from '../../entities/user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class PatientService {
  constructor(
    @InjectRepository(Patient) private repo: Repository<Patient>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async create(data: any) {
    const { email, password, ...rest } = data || {};
    if (email && password) {
      const exists = await this.userRepo.findOne({ where: { email } });
      if (exists) throw new Error('Email already in use');
      const passwordHash = await bcrypt.hash(password, 10);
      const user = await this.userRepo.save(this.userRepo.create({ email, passwordHash, role: UserRole.Patient }));
      const patient = this.repo.create({ ...rest, user: { id: user.id } as any });
      return this.repo.save(patient);
    }
    // Create patient profile only; invite later to set password
    const patient = this.repo.create({ ...rest });
    return this.repo.save(patient);
  }
  findAll() { return this.repo.find(); }
  findOne(id: string) { return this.repo.findOne({ where: { id } }); }

  async update(id: string, data: Partial<Patient>) {
    await this.repo.update({ id }, data);
    return this.findOne(id);
  }

  async getDoctorsFromPrescriptions(patientId: string) {
    // Basic query using raw SQL for distinct doctor ids from prescriptions
    const rows = await this.repo.query(
      `SELECT DISTINCT p.doctor_id as "doctorId" FROM prescription p WHERE p.patient_id = $1 AND p.doctor_id IS NOT NULL`,
      [patientId],
    );
    return rows.map((r: any) => r.doctorId);
  }

  async isDoctorLinkedToPatient(doctorId: string, patientId: string): Promise<boolean> {
    if (!doctorId || !patientId) return false;
    const appt = await this.repo.query(
      'SELECT 1 FROM appointment WHERE patient_id = $1 AND doctor_id = $2 LIMIT 1',
      [patientId, doctorId],
    );
    if (appt.length > 0) return true;
    const rx = await this.repo.query(
      'SELECT 1 FROM prescription WHERE patient_id = $1 AND doctor_id = $2 LIMIT 1',
      [patientId, doctorId],
    );
    return rx.length > 0;
  }
}
