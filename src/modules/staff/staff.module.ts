import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StaffService } from './staff.service';
import { StaffController } from './staff.controller';
import { Staff } from '../../entities/staff.entity';
import { Timings } from '../../entities/timings.entity';
import { Leave } from '../../entities/leave.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Staff, Timings, Leave])],
  controllers: [StaffController],
  providers: [StaffService],
  exports: [StaffService]
})
export class StaffModule {}
