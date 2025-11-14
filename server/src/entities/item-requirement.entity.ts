import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'item_requirement' })
export class ItemRequirement {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  primaryUserId!: string; // base user.id of requester

  @Column({ type: 'varchar' })
  kind!: 'equipment' | 'blood';

  @Column({ type: 'int' })
  quantity!: number;

  @Column({ type: 'varchar', default: 'pending' })
  status!: string;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
