import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ItemRequirement } from './item-requirement.entity';
import { InventoryItem } from './inventory-item.entity';

@Entity({ name: 'item_requirement_fulfillment' })
export class ItemRequirementFulfillment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => ItemRequirement, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'requirementId' })
  requirement!: ItemRequirement;

  @ManyToOne(() => InventoryItem, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'inventoryItemId' })
  inventoryItem!: InventoryItem;

  @Column({ type: 'int' })
  quantity!: number;

  @Column({ type: 'timestamp', nullable: true })
  startAt!: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  endAt!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
