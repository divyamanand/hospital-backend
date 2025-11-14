import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'inventory_item' })
export class InventoryItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ type: 'varchar' })
  type!: 'medicine' | 'equipment' | 'blood' | 'supply';

  @Column({ type: 'int', default: 0 })
  quantity!: number;

  @Column({ type: 'varchar', nullable: true })
  unit!: string | null;

  @Column({ type: 'date', nullable: true })
  expiry!: string | null;

  @Column({ type: 'varchar', nullable: true })
  lotNumber!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
