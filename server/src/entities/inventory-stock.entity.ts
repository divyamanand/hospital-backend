import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { InventoryItem } from './inventory-item.entity';

@Entity({ name: 'inventory_stock' })
export class InventoryStock {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => InventoryItem, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inventoryItemId' })
  inventoryItem!: InventoryItem;

  @Column({ type: 'int', default: 0 })
  quantity!: number;

  @Column({ type: 'varchar', nullable: true })
  unit!: string | null;

  @Column({ type: 'date', nullable: true })
  expiry!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
