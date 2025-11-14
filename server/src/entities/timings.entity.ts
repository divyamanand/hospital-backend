import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Staff } from './staff.entity';

@Entity({ name: 'timings' })
export class Timings {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Staff, (s) => s.timings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'staff_id' })
  staff!: Staff;

  @Column({ type: 'int' })
  weekday!: number; // 0-6

  @Column({ type: 'time' })
  startTime!: string;

  @Column({ type: 'time' })
  endTime!: string;

  @Column({ type: 'boolean', default: true })
  isAvailable!: boolean;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
