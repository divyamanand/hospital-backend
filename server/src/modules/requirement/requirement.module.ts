import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequirementService } from './requirement.service';
import { RequirementController } from './requirement.controller';
import { ItemRequirement } from '../../entities/item-requirement.entity';
import { ItemRequirementFulfillment } from '../../entities/item-requirement-fulfillment.entity';
import { StaffRequirement } from '../../entities/staff-requirement.entity';
import { StaffRequirementFulfillment } from '../../entities/staff-requirement-fulfillment.entity';
import { RoomRequirement } from '../../entities/room-requirement.entity';
import { RoomRequirementFulfillment } from '../../entities/room-requirement-fulfillment.entity';
import { InventoryItem } from '../../entities/inventory-item.entity';
import { Staff } from '../../entities/staff.entity';
import { Room } from '../../entities/room.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ItemRequirement,
      ItemRequirementFulfillment,
      StaffRequirement,
      StaffRequirementFulfillment,
      RoomRequirement,
      RoomRequirementFulfillment,
      InventoryItem,
      Staff,
      Room,
    ]),
  ],
  controllers: [RequirementController],
  providers: [RequirementService],
})
export class RequirementModule {}
