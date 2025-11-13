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
  listByType(type: InventoryItem['type']) { return this.itemRepo.find({ where: { type } as any }); }
  createItem(data: Partial<InventoryItem>) { return this.itemRepo.save(this.itemRepo.create(data)); }
  async updateItem(id: string, data: Partial<InventoryItem>) { await this.itemRepo.update({ id }, data); return this.itemRepo.findOne({ where: { id } }); }
  async deleteItem(id: string) { await this.itemRepo.delete({ id }); return { id, removed: true } as any; }

  getItemByName(name: string) {
    return this.itemRepo.createQueryBuilder('i')
      .where('LOWER(i.name) = LOWER(:name)', { name })
      .getOne();
  }

  async addStock(id: string, quantity: number, referenceId?: string) {
    const item = await this.itemRepo.findOne({ where: { id } });
    if (!item || quantity <= 0) return null;
    await this.txnRepo.save(this.txnRepo.create({ inventoryItem: item, change: quantity, reason: InventoryChangeReason.Purchase, referenceId: referenceId || null }));
    await this.itemRepo.update({ id }, { quantityOnHand: (item.quantityOnHand || 0) + quantity });
    return this.itemRepo.findOne({ where: { id } });
  }

  async dispenseItem(id: string, quantity: number, referenceId?: string) {
    const item = await this.itemRepo.findOne({ where: { id } });
    if (!item || quantity <= 0) return null;
    await this.txnRepo.save(this.txnRepo.create({ inventoryItem: item, change: -Math.abs(quantity), reason: InventoryChangeReason.Use, referenceId: referenceId || null }));
    await this.itemRepo.update({ id }, { quantityOnHand: (item.quantityOnHand || 0) - Math.abs(quantity) });
    return this.itemRepo.findOne({ where: { id } });
  }

  async removeExpired() {
    const today = new Date();
    const iso = today.toISOString().slice(0,10);
    const expired = await this.itemRepo.createQueryBuilder('i')
      .where('i.expiry_date IS NOT NULL AND i.expiry_date < :today', { today: iso })
      .getMany();
    const ids = expired.map(e => e.id);
    if (ids.length === 0) return { removed: 0 } as any;
    await this.itemRepo.createQueryBuilder().delete().from(InventoryItem).where('id IN (:...ids)', { ids }).execute();
    return { removed: ids.length, ids } as any;
  }

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
