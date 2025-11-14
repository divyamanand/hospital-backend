import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from '../../entities/appointment.entity';
import { Invitation } from '../../entities/invitation.entity';
import { InventoryItem } from '../../entities/inventory-item.entity';
import { InventoryTransaction } from '../../entities/inventory-transaction.entity';
import { Room } from '../../entities/room.entity';
import { Leave } from '../../entities/leave.entity';
import { Activity } from '../../entities/activity.entity';
import { ItemRequirement } from '../../entities/item-requirement.entity';
import { StaffRequirement } from '../../entities/staff-requirement.entity';
import { RoomRequirement } from '../../entities/room-requirement.entity';
import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';

@Module({
  imports: [TypeOrmModule.forFeature([
    Appointment,
    Invitation,
    InventoryItem,
    InventoryTransaction,
    Room,
    Leave,
    Activity,
    ItemRequirement,
    StaffRequirement,
    RoomRequirement,
  ])],
  providers: [StatsService],
  controllers: [StatsController],
  exports: [StatsService],
})
export class StatsModule {}
