import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryItem } from '../../entities/inventory-item.entity';
import { InventoryTransaction } from '../../entities/inventory-transaction.entity';
import { Prescription } from '../../entities/prescription.entity';
import { PrescriptionItem } from '../../entities/prescription-item.entity';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';

@Module({
	imports: [TypeOrmModule.forFeature([InventoryItem, InventoryTransaction, Prescription, PrescriptionItem])],
	controllers: [InventoryController],
	providers: [InventoryService],
})
export class InventoryModule {}
