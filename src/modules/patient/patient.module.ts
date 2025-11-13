import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientService } from './patient.service';
import { PatientController } from './patient.controller';
import { Patient } from '../../entities/patient.entity';
import { Appointment } from '../../entities/appointment.entity';
import { RolesGuard } from '../auth/roles.guard';
import { PatientOrDoctorGuard } from '../auth/patient-or-doctor.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Patient, Appointment, User])],
  controllers: [PatientController],
  providers: [PatientService, RolesGuard, PatientOrDoctorGuard, JwtAuthGuard],
  exports: [PatientService]
})
export class PatientModule {}
