import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { InventoryItem } from './inventory-item.entity';

@Entity({ name: 'inventory_transaction' })
export class InventoryTransaction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => InventoryItem, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inventory_item_id' })
  inventoryItem!: InventoryItem;

  @Column({ type: 'varchar' })
  type!: 'in' | 'out' | 'adjust' | 'fulfill';

  @Column({ type: 'int' })
  quantity!: number;

  @Column({ type: 'varchar', nullable: true })
  reason!: string | null;

  @Column({ type: 'varchar', nullable: true })
  refPrescriptionItemId!: string | null;

  @CreateDateColumn()
  createdAt!: Date;
}
