import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Staff } from './staff.entity';

export enum LeaveStatus {
  Approved = 'approved',
  Pending = 'pending',
  Rejected = 'rejected',
}

@Entity({ name: 'leave' })
export class Leave {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Staff, (s) => s.leaves, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'staff_id' })
  staff!: Staff;

  @Column({ type: 'timestamp' })
  startDatetime!: Date;

  @Column({ type: 'timestamp' })
  endDatetime!: Date;

  @Column({ type: 'text', nullable: true })
  reason!: string | null;

  @Column({ type: 'enum', enum: LeaveStatus, default: LeaveStatus.Pending })
  status!: LeaveStatus;

  @Column({ type: 'boolean', default: false })
  isFullDay!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
