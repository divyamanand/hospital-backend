import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { RequirementStatus } from './item-requirement.entity';

@Entity({ name: 'staff_requirement' })
export class StaffRequirement {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  primaryUserId!: string; // base user.id of requester

  @Column({ type: 'varchar' })
  roleNeeded!: string;

  @Column({ type: 'int' })
  quantity!: number;

  @Column({ type: 'enum', enum: RequirementStatus, default: RequirementStatus.Open })
  status!: RequirementStatus;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
