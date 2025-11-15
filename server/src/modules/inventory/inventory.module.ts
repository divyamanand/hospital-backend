import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryItem } from '../../entities/inventory-item.entity';
import { InventoryTransaction } from '../../entities/inventory-transaction.entity';
import { InventoryStock } from '../../entities/inventory-stock.entity';
import { Prescription } from '../../entities/prescription.entity';
import { PrescriptionItem } from '../../entities/prescription-item.entity';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { RolesGuard } from '../auth/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Module({
	imports: [TypeOrmModule.forFeature([InventoryItem, InventoryTransaction, InventoryStock, Prescription, PrescriptionItem])],
	controllers: [InventoryController],
	providers: [InventoryService, RolesGuard, JwtAuthGuard],
})
export class InventoryModule {}
