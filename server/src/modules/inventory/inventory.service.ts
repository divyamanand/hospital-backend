import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryItem } from '../../entities/inventory-item.entity';
import { InventoryTransaction } from '../../entities/inventory-transaction.entity';
import { InventoryStock } from '../../entities/inventory-stock.entity';
import { Prescription } from '../../entities/prescription.entity';
import { PrescriptionItem } from '../../entities/prescription-item.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventoryItem) private itemRepo: Repository<InventoryItem>,
    @InjectRepository(InventoryTransaction) private txnRepo: Repository<InventoryTransaction>,
    @InjectRepository(InventoryStock) private stockRepo: Repository<InventoryStock>,
    @InjectRepository(Prescription) private presRepo: Repository<Prescription>,
    @InjectRepository(PrescriptionItem) private presItemRepo: Repository<PrescriptionItem>,
  ) {}

  async listItems(filter?: any) {
    // Aggregate total quantity and nearest expiry from stocks
    const qb = this.itemRepo.createQueryBuilder('i')
      .leftJoin(InventoryStock, 's', 's."inventoryItemId" = i.id')
      .select('i.id', 'id')
      .addSelect('i.name', 'name')
      .addSelect('i.type', 'type')
      .addSelect('i.unit', 'unit')
      .addSelect('COALESCE(SUM(s.quantity), 0)', 'quantity')
      .addSelect('MIN(s.expiry)', 'expiry')
      .groupBy('i.id');
    if (filter?.type) qb.andWhere('i.type = :type', { type: filter.type });
    if (filter?.lowStock) qb.having('COALESCE(SUM(s.quantity),0) < :ls', { ls: filter.lowStock });
    if (filter?.expiryBefore) qb.having('MIN(s.expiry) IS NOT NULL AND MIN(s.expiry) < :exp', { exp: filter.expiryBefore });
    const rows = await qb.getRawMany();
    // Map to InventoryItem-like objects for controller mapper
    return rows.map((r: any) => ({
      id: r.id,
      name: r.name,
      type: r.type,
      unit: r.unit,
      quantity: parseInt(r.quantity, 10) || 0,
      expiry: r.expiry || null,
    }));
  }
  listByType(type: InventoryItem['type']) { return this.itemRepo.find({ where: { type } as any }); }
  createItem(data: Partial<InventoryItem>) { return this.itemRepo.save(this.itemRepo.create(data)); }
  async updateItem(id: string, data: Partial<InventoryItem>) { await this.itemRepo.update({ id }, data); return this.itemRepo.findOne({ where: { id } }); }
  async deleteItem(id: string) { await this.itemRepo.delete({ id }); return { id, removed: true } as any; }

  getItemByName(name: string) {
    return this.itemRepo.createQueryBuilder('i')
      .where('LOWER(i.name) = LOWER(:name)', { name })
      .getOne();
  }

  async addStock(id: string, quantity: number, referenceId?: string, unit?: string | null, expiry?: string | null) {
    const item = await this.itemRepo.findOne({ where: { id } });
    if (!item || quantity <= 0) return null;
    const stock = await this.stockRepo.save(this.stockRepo.create({ inventoryItem: item, quantity, unit: unit ?? item.unit ?? null, expiry: expiry ?? null }));
    await this.txnRepo.save(this.txnRepo.create({ inventoryItem: item, type: 'in', quantity, reason: referenceId || null, refPrescriptionItemId: null }));
    // maintain cached total quantity on item for compatibility
    await this.itemRepo.update({ id }, { quantity: (item.quantity || 0) + quantity });
    return stock;
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
  async listTransactions(filter?: any) {
    const qb = this.txnRepo.createQueryBuilder('t').leftJoinAndSelect('t.inventoryItem','item');
    qb.where('1=1');
    if (filter?.itemId) qb.andWhere('t.inventoryItemId = :iid', { iid: filter.itemId });
    if (filter?.type) qb.andWhere('t.type = :tt', { tt: filter.type });
    if (filter?.from) qb.andWhere('t.createdAt >= :from', { from: filter.from });
    if (filter?.to) qb.andWhere('t.createdAt <= :to', { to: filter.to });
    qb.orderBy('t.createdAt','DESC');
    return qb.getMany();
  }
  // Basic placeholder; prescription fulfillment handled in prescription module
  async fulfillPrescription(prescriptionId: string) {
    return { id: prescriptionId, status: 'not_implemented' } as any;
  }
}
