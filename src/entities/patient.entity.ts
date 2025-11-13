import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Staff } from './staff.entity';

export enum PatientGender {
  Male = 'male',
  Female = 'female',
  Other = 'other',
}

export enum BloodGroup {
  APos = 'A+',
  ANeg = 'A-',
  BPos = 'B+',
  BNeg = 'B-',
  ABPos = 'AB+',
  ABNeg = 'AB-',
  OPos = 'O+',
  ONeg = 'O-',
  Unknown = 'Unknown',
}

@Entity({ name: 'patient' })
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: false })
  firstName!: string;

  @Column({ nullable: true })
  lastName!: string | null;

  @Index('idx_patient_email', { unique: true })
  @Column({ nullable: true, unique: true })
  email!: string | null;

  @Index('idx_patient_phone', { unique: true })
  @Column({ nullable: true, unique: true })
  phone!: string | null;

  @Column({ type: 'date', nullable: true })
  dateOfBirth!: string | null;

  @Column({ type: 'enum', enum: PatientGender, nullable: true })
  gender!: PatientGender | null;

  @Column({ type: 'enum', enum: BloodGroup, default: BloodGroup.Unknown })
  bloodGroup!: BloodGroup;

  @Column({ type: 'text', nullable: true })
  address!: string | null;

  @Column({ nullable: true })
  emergencyContactName!: string | null;

  @Column({ nullable: true })
  emergencyContactPhone!: string | null;

  @Index('idx_patient_mrn', { unique: true })
  @Column({ nullable: true, unique: true })
  medicalRecordNumber!: string | null; // MRN

  @Column({ type: 'text', nullable: true })
  allergies!: string | null;

  @Column({ type: 'text', nullable: true })
  chronicConditions!: string | null;

  @Column({ nullable: true })
  insuranceProvider!: string | null;

  @Column({ nullable: true })
  insurancePolicyNo!: string | null;

  @ManyToOne(() => Staff, { nullable: true })
  @JoinColumn({ name: 'primary_physician_id' })
  primaryPhysician!: Staff | null;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @Column({ nullable: true })
  createdBy!: string | null;

  @Column({ nullable: true })
  updatedBy!: string | null;

  @Column({ default: false })
  isDeleted!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
