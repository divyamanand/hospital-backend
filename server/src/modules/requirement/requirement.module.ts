import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Requirement } from '../../entities/requirement.entity';
import { RequirementFulfillment } from '../../entities/requirement-fulfillment.entity';
import { Staff } from '../../entities/staff.entity';
import { Timings } from '../../entities/timings.entity';
import { Leave } from '../../entities/leave.entity';
import { Appointment } from '../../entities/appointment.entity';
import { RequirementController } from './requirement.controller';
import { RequirementService } from './requirement.service';
import { ItemRequirement } from '../../entities/item-requirement.entity';
import { StaffRequirement } from '../../entities/staff-requirement.entity';
import { RoomRequirement } from '../../entities/room-requirement.entity';
import { Patient } from '../../entities/patient.entity';
import { User } from '../../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    Requirement,
    RequirementFulfillment,
    Staff,
    Timings,
    Leave,
    Appointment,
    ItemRequirement,
    StaffRequirement,
    RoomRequirement,
    Patient,
    User,
  ])],
  controllers: [RequirementController],
  providers: [RequirementService],
})
export class RequirementModule {}
