import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Prescription } from '../../entities/prescription.entity';
import { PrescriptionItem } from '../../entities/prescription-item.entity';
import { InventoryItem } from '../../entities/inventory-item.entity';
import { InventoryTransaction } from '../../entities/inventory-transaction.entity';
import { PrescriptionController } from './prescription.controller';
import { PrescriptionService } from './prescription.service';

@Module({
	imports: [TypeOrmModule.forFeature([Prescription, PrescriptionItem, InventoryItem, InventoryTransaction])],
	controllers: [PrescriptionController],
	providers: [PrescriptionService],
})
export class PrescriptionModule {}
