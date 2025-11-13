import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum InventoryType {
  Medicine = 'medicine',
  Supply = 'supply',
  Equipment = 'equipment',
  Blood = 'blood',
}

export enum InventoryStatus {
  Active = 'active',
  Inactive = 'inactive',
}

@Entity({ name: 'inventory_item' })
export class InventoryItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index('idx_inventory_sku', { unique: true })
  @Column({ unique: true })
  sku!: string;

  @Column()
  name!: string;

  @Column({ type: 'enum', enum: InventoryType })
  type!: InventoryType;

  @Column({ nullable: true })
  brand!: string | null;

  @Column({ nullable: true })
  batchNo!: string | null;

  @Column({ type: 'date', nullable: true })
  expiryDate!: string | null;

  @Column({ type: 'int', default: 0 })
  quantityOnHand!: number;

  @Column({ type: 'int', default: 0 })
  reorderLevel!: number;

  @Column({ nullable: true })
  unit!: string | null; // tablets, ml, pcs

  @Column({ nullable: true })
  location!: string | null;

  @Column({ type: 'enum', enum: InventoryStatus, default: InventoryStatus.Active })
  status!: InventoryStatus;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
