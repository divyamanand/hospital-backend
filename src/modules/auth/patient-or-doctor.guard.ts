import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from '../../entities/patient.entity';
import { Appointment, AppointmentStatus } from '../../entities/appointment.entity';

@Injectable()
export class PatientOrDoctorGuard implements CanActivate {
  constructor(
    @InjectRepository(Patient) private patientRepo: Repository<Patient>,
    @InjectRepository(Appointment) private apptRepo: Repository<Appointment>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: any = context.switchToHttp().getRequest();
    const user = req.user;
    if (!user) throw new ForbiddenException('Unauthorized');
    const patientId = req.params?.id || req.params?.patientId;
    if (!patientId) return true; // if not a patient-scoped route, allow

    // Admin can access
    if (user.role === 'admin' || user.role === 'receptionist') return true;

    if (user.role === 'patient') {
      if (user.id === patientId) return true;
      throw new ForbiddenException('Patients can only access their data');
    }

    if (user.role === 'doctor') {
      // Access if primary physician or has any appointment with patient
      const patient = await this.patientRepo.findOne({ where: { id: patientId }, relations: ['primaryPhysician'] });
      if (patient?.primaryPhysician && (patient.primaryPhysician as any).id === user.id) return true;
      const busy = [
        AppointmentStatus.Pending,
        AppointmentStatus.Confirmed,
        AppointmentStatus.CheckedIn,
        AppointmentStatus.InProgress,
        AppointmentStatus.Completed,
      ];
      const count = await this.apptRepo.createQueryBuilder('a')
        .where('a.patient_id = :pid', { pid: patientId })
        .andWhere('a.doctor_id = :did', { did: user.id })
        .andWhere('a.status IN (:...st)', { st: busy })
        .getCount();
      if (count > 0) return true;
      throw new ForbiddenException('Doctor not assigned to this patient');
    }

    throw new ForbiddenException('Insufficient role');
  }
}
