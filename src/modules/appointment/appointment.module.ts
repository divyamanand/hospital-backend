import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentService } from './appointment.service';
import { AppointmentController } from './appointment.controller';
import { Appointment } from '../../entities/appointment.entity';
import { RolesGuard } from '../auth/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Staff } from '../../entities/staff.entity';
import { Timings } from '../../entities/timings.entity';
import { Leave } from '../../entities/leave.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Appointment, Staff, Timings, Leave])],
  controllers: [AppointmentController],
  providers: [AppointmentService, RolesGuard, JwtAuthGuard],
  exports: [AppointmentService]
})
export class AppointmentModule {}
