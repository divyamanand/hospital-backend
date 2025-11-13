import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryItem, InventoryStatus } from '../../entities/inventory-item.entity';
import { InventoryTransaction, InventoryChangeReason } from '../../entities/inventory-transaction.entity';
import { Prescription } from '../../entities/prescription.entity';
import { PrescriptionItem } from '../../entities/prescription-item.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventoryItem) private itemRepo: Repository<InventoryItem>,
    @InjectRepository(InventoryTransaction) private txnRepo: Repository<InventoryTransaction>,
    @InjectRepository(Prescription) private presRepo: Repository<Prescription>,
    @InjectRepository(PrescriptionItem) private presItemRepo: Repository<PrescriptionItem>,
  ) {}

  listItems() { return this.itemRepo.find(); }
  createItem(data: Partial<InventoryItem>) { return this.itemRepo.save(this.itemRepo.create(data)); }
  async updateItem(id: string, data: Partial<InventoryItem>) { await this.itemRepo.update({ id }, data); return this.itemRepo.findOne({ where: { id } }); }

  async adjustItem(id: string, body: { change: number; reason: string; referenceId?: string }) {
    const item = await this.itemRepo.findOne({ where: { id } });
    if (!item) return null;
    await this.txnRepo.save(this.txnRepo.create({
      inventoryItem: item,
      change: body.change,
      reason: body.reason as InventoryChangeReason,
      referenceId: body.referenceId || null,
    }));
    await this.itemRepo.update({ id }, { quantityOnHand: (item.quantityOnHand || 0) + body.change });
    return this.itemRepo.findOne({ where: { id } });
  }

  async fulfillPrescription(prescriptionId: string) {
    // naive: mark items fulfilled and create txns
    const pres = await this.presRepo.findOne({ where: { id: prescriptionId }, relations: ['items','items.inventoryItem'] });
    if (!pres) return null;
    for (const item of pres.items || []) {
      if (item.quantity && !item.fulfilled && item.inventoryItem) {
        await this.txnRepo.save(this.txnRepo.create({
          inventoryItem: item.inventoryItem,
          change: -Math.abs(item.quantity),
          reason: InventoryChangeReason.PrescriptionFulfill,
          referenceId: item.id,
        }));
        await this.presItemRepo.update({ id: item.id }, { fulfilled: true, fulfilledAt: new Date() });
        await this.itemRepo.update({ id: item.inventoryItem.id }, { quantityOnHand: (item.inventoryItem.quantityOnHand || 0) - Math.abs(item.quantity) });
      }
    }
    return this.presRepo.findOne({ where: { id: prescriptionId }, relations: ['items'] });
  }
}
