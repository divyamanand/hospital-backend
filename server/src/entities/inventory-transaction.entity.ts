import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { InventoryItem } from './inventory-item.entity';

export enum InventoryChangeReason {
  Purchase = 'purchase',
  Use = 'use',
  Adjustment = 'adjustment',
  PrescriptionFulfill = 'prescription_fulfill',
  Transfer = 'transfer',
}

@Entity({ name: 'inventory_transaction' })
export class InventoryTransaction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => InventoryItem, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inventory_item_id' })
  inventoryItem!: InventoryItem;

  @Column({ type: 'int' })
  change!: number; // +/-

  @Column({ type: 'enum', enum: InventoryChangeReason })
  reason!: InventoryChangeReason;

  @Column({ type: 'varchar', nullable: true })
  referenceId!: string | null; // e.g., prescription_item_id

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ type: 'varchar', nullable: true })
  createdBy!: string | null;
}
