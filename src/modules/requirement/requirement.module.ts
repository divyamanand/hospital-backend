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

@Module({
  imports: [TypeOrmModule.forFeature([Requirement, RequirementFulfillment, Staff, Timings, Leave, Appointment])],
  controllers: [RequirementController],
  providers: [RequirementService],
})
export class RequirementModule {}
