import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Prescription } from './prescription.entity';
import { InventoryItem } from './inventory-item.entity';

@Entity({ name: 'prescription_item' })
export class PrescriptionItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Prescription, (p) => p.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'prescription_id' })
  prescription!: Prescription;

  @ManyToOne(() => InventoryItem, { nullable: true })
  @JoinColumn({ name: 'inventory_item_id' })
  inventoryItem!: InventoryItem | null;

  @Column()
  medicineName!: string;

  @Column()
  dosage!: string; // e.g., 500mg

  @Column()
  frequency!: string; // e.g., twice daily

  @Column({ type: 'int' })
  durationDays!: number;

  @Column({ type: 'int', nullable: true })
  quantity!: number | null;

  @Column({ type: 'text', nullable: true })
  instructions!: string | null;

  @Column({ type: 'boolean', default: false })
  fulfilled!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  fulfilledAt!: Date | null;
}
