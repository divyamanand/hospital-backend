import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prescription, PrescriptionStatus } from '../../entities/prescription.entity';
import { PrescriptionItem } from '../../entities/prescription-item.entity';
import { InventoryItem } from '../../entities/inventory-item.entity';
import { InventoryTransaction, InventoryChangeReason } from '../../entities/inventory-transaction.entity';

@Injectable()
export class PrescriptionService {
  constructor(
    @InjectRepository(Prescription) private presRepo: Repository<Prescription>,
    @InjectRepository(PrescriptionItem) private itemRepo: Repository<PrescriptionItem>,
    @InjectRepository(InventoryItem) private invRepo: Repository<InventoryItem>,
    @InjectRepository(InventoryTransaction) private txnRepo: Repository<InventoryTransaction>,
  ) {}

  create(data: Partial<Prescription>) { return this.presRepo.save(this.presRepo.create(data)); }
  findAll(patientId?: string) {
    const where: any = patientId ? { patient: { id: patientId } } : {};
    return this.presRepo.find({ where, relations: ['patient','doctor','items'] });
  }
  async update(id: string, data: Partial<Prescription>) { await this.presRepo.update({ id }, data); return this.presRepo.findOne({ where: { id }, relations: ['items'] }); }

  async dispense(id: string) {
    const pres = await this.presRepo.findOne({ where: { id }, relations: ['items'] });
    if (!pres) return null;
    for (const item of pres.items || []) {
      if (item.quantity && !item.fulfilled) {
        await this.txnRepo.save(this.txnRepo.create({
          inventoryItem: item.inventoryItem as any,
          change: -Math.abs(item.quantity),
          reason: InventoryChangeReason.PrescriptionFulfill,
          referenceId: item.id,
        }));
        await this.itemRepo.update({ id: item.id }, { fulfilled: true, fulfilledAt: new Date() });
      }
    }
    await this.presRepo.update({ id }, { status: PrescriptionStatus.Dispensed });
    return this.presRepo.findOne({ where: { id }, relations: ['items'] });
  }
}
