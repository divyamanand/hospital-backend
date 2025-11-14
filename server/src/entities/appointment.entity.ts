import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Patient } from './patient.entity';
import { Staff } from './staff.entity';
@Entity({ name: 'appointment' })
@Index('idx_appt_doctor_start', ['doctor'])
@Index('idx_appt_patient_start', ['patient'])
@Index('idx_appt_status', ['status'])
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Patient, { nullable: false })
  @JoinColumn({ name: 'patientId' })
  patient!: Patient;

  @ManyToOne(() => Staff, { nullable: false })
  @JoinColumn({ name: 'doctorId' })
  doctor!: Staff | null;

  @Column({ type: 'timestamp' })
  startAt!: Date;

  @Column({ type: 'timestamp' })
  endAt!: Date;

  @Column({ type: 'varchar', default: 'scheduled' })
  status!: 'scheduled' | 'confirmed' | 'checkedIn' | 'completed' | 'cancelled';

  @Column({ type: 'text', nullable: true })
  cancelReason!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
