import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryItem } from '../../entities/inventory-item.entity';
import { InventoryTransaction } from '../../entities/inventory-transaction.entity';
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
    await this.txnRepo.save(this.txnRepo.create({ inventoryItem: item, type: 'in', quantity, reason: referenceId || null, refPrescriptionItemId: null }));
    await this.itemRepo.update({ id }, { quantity: (item.quantity || 0) + quantity });
    return this.itemRepo.findOne({ where: { id } });
  }

  async dispenseItem(id: string, quantity: number, referenceId?: string) {
    const item = await this.itemRepo.findOne({ where: { id } });
    if (!item || quantity <= 0) return null;
    const qty = Math.abs(quantity);
    await this.txnRepo.save(this.txnRepo.create({ inventoryItem: item, type: 'out', quantity: qty, reason: referenceId || null, refPrescriptionItemId: null }));
    await this.itemRepo.update({ id }, { quantity: (item.quantity || 0) - qty });
    return this.itemRepo.findOne({ where: { id } });
  }

  async removeExpired() {
    const today = new Date();
    const iso = today.toISOString().slice(0,10);
    const expired = await this.itemRepo.createQueryBuilder('i')
      .where('i.expiry IS NOT NULL AND i.expiry < :today', { today: iso })
      .getMany();
    const ids = expired.map(e => e.id);
    if (ids.length === 0) return { removed: 0 } as any;
    await this.itemRepo.createQueryBuilder().delete().from(InventoryItem).where('id IN (:...ids)', { ids }).execute();
    return { removed: ids.length, ids } as any;
  }

  async adjustItem(id: string, body: { quantity: number; reason?: string; refPrescriptionItemId?: string }) {
    const item = await this.itemRepo.findOne({ where: { id } });
    if (!item) return null;
    await this.txnRepo.save(this.txnRepo.create({
      inventoryItem: item,
      type: 'adjust',
      quantity: body.quantity,
      reason: body.reason || null,
      refPrescriptionItemId: body.refPrescriptionItemId || null,
    }));
    await this.itemRepo.update({ id }, { quantity: (item.quantity || 0) + body.quantity });
    return this.itemRepo.findOne({ where: { id } });
  }
  // Prescription fulfillment moved to prescription flow with explicit mapping in new schema
}
