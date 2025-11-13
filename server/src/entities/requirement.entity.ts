import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Appointment } from './appointment.entity';

export enum RequirementType {
  Room = 'room',
  Staff = 'staff',
  Equipment = 'equipment',
}

export enum RequirementStatus {
  Pending = 'pending',
  Fulfilled = 'fulfilled',
  Cancelled = 'cancelled',
}

@Entity({ name: 'requirement' })
export class Requirement {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'enum', enum: RequirementType })
  type!: RequirementType;

  @Column()
  relatedEntityId!: string; // room_id/equipment_id/staff_role reference

  @Column({ type: 'int', default: 1 })
  quantity!: number;

  @ManyToOne(() => Appointment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'appointment_id' })
  appointment!: Appointment;

  @Column({ type: 'enum', enum: RequirementStatus, default: RequirementStatus.Pending })
  status!: RequirementStatus;
}
