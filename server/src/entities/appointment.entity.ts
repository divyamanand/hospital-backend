import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Patient } from './patient.entity';
import { Staff } from './staff.entity';
import { Specialty } from './specialty.entity';
import { Room } from './room.entity';
import { Issue } from './issue.entity';

export enum AppointmentType {
  Diagnosis = 'diagnosis',
  Operation = 'operation',
  FollowUp = 'followup',
  Teleconsult = 'teleconsult',
}

export enum AppointmentStatus {
  Pending = 'pending',
  Confirmed = 'confirmed',
  CheckedIn = 'checked_in',
  InProgress = 'in_progress',
  Completed = 'completed',
  Cancelled = 'cancelled',
  NoShow = 'no_show',
}

export enum AppointmentRequestedBy {
  Patient = 'patient',
  Receptionist = 'receptionist',
  System = 'system',
}

export enum AppointmentPriority {
  Normal = 'normal',
  Urgent = 'urgent',
}

@Entity({ name: 'appointment' })
@Index('idx_appt_doctor_start', ['doctor', 'scheduledStart'])
@Index('idx_appt_patient_start', ['patient', 'scheduledStart'])
@Index('idx_appt_status', ['status'])
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Patient, { nullable: false })
  @JoinColumn({ name: 'patient_id' })
  patient!: Patient;

  @ManyToOne(() => Staff, { nullable: true })
  @JoinColumn({ name: 'doctor_id' })
  doctor!: Staff | null;

  @ManyToOne(() => Specialty, { nullable: true })
  @JoinColumn({ name: 'specialty_id' })
  specialty!: Specialty | null;

  @Column({ type: 'enum', enum: AppointmentType })
  appointmentType!: AppointmentType;

  @Column({ type: 'enum', enum: AppointmentStatus, default: AppointmentStatus.Pending })
  status!: AppointmentStatus;

  @Column({ type: 'enum', enum: AppointmentRequestedBy })
  requestedBy!: AppointmentRequestedBy;

  @ManyToOne(() => Issue, { nullable: true })
  @JoinColumn({ name: 'requested_issue_id' })
  requestedIssue!: Issue | null;

  @Column({ type: 'timestamp', nullable: true })
  scheduledStart!: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  scheduledEnd!: Date | null;

  @Column({ type: 'int', nullable: true })
  durationMinutes!: number | null;

  @ManyToOne(() => Room, { nullable: true })
  @JoinColumn({ name: 'room_id' })
  room!: Room | null;

  @Column({ type: 'enum', enum: AppointmentPriority, default: AppointmentPriority.Normal })
  priority!: AppointmentPriority;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @Column({ type: 'uuid', nullable: true })
  createdFromPrescriptionId!: string | null;

  @Column({ type: 'text', nullable: true })
  cancelReason!: string | null;

  @Column({ default: false })
  isDeleted!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
