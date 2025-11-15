import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { StaffRequirement } from './staff-requirement.entity';
import { Staff } from './staff.entity';

@Entity({ name: 'staff_requirement_fulfillment' })
export class StaffRequirementFulfillment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => StaffRequirement, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'requirementId' })
  requirement!: StaffRequirement;

  @ManyToOne(() => Staff, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'staffId' })
  staff!: Staff;

  @Column({ type: 'timestamp', nullable: true })
  startAt!: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  endAt!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
