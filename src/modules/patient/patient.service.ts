import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from '../../entities/patient.entity';

@Injectable()
export class PatientService {
  constructor(@InjectRepository(Patient) private repo: Repository<Patient>) {}

  create(data: Partial<Patient>) { return this.repo.save(this.repo.create(data)); }
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
}
