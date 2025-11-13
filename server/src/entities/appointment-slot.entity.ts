import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Staff } from './staff.entity';
import { Appointment } from './appointment.entity';

export enum SlotSource {
  Timings = 'timings',
  AdminBlock = 'admin_block',
  SystemGenerated = 'system_generated',
}

@Entity({ name: 'appointment_slot' })
export class AppointmentSlot {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Staff, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'doctor_id' })
  doctor!: Staff;

  @Column({ type: 'timestamp' })
  slotStart!: Date;

  @Column({ type: 'timestamp' })
  slotEnd!: Date;

  @Column({ type: 'boolean', default: false })
  isBooked!: boolean;

  @ManyToOne(() => Appointment, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'appointment_id' })
  appointment!: Appointment | null;

  @Column({ type: 'enum', enum: SlotSource })
  source!: SlotSource;
}
