import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Appointment } from './appointment.entity';
import { Patient } from './patient.entity';
import { Staff } from './staff.entity';
import { PrescriptionItem } from './prescription-item.entity';

export enum PrescriptionStatus {
  Draft = 'draft',
  Finalized = 'finalized',
  Dispensed = 'dispensed',
  Cancelled = 'cancelled',
}

@Entity({ name: 'prescription' })
export class Prescription {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Appointment, { nullable: true })
  @JoinColumn({ name: 'appointment_id' })
  appointment!: Appointment | null;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patient_id' })
  patient!: Patient;

  @ManyToOne(() => Staff)
  @JoinColumn({ name: 'doctor_id' })
  doctor!: Staff;

  @Column({ type: 'timestamp' })
  issuedAt!: Date;

  @Column({ type: 'text', nullable: true })
  diagnosis!: string | null;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @Column({ type: 'enum', enum: PrescriptionStatus, default: PrescriptionStatus.Draft })
  status!: PrescriptionStatus;

  @Column({ type: 'int', default: 1 })
  version!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => PrescriptionItem, (pi) => pi.prescription)
  items!: PrescriptionItem[];
}
