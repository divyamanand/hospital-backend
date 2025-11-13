import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, OneToOne } from 'typeorm';
import { Staff } from './staff.entity';
import { Patient } from './patient.entity';

export enum UserRole {
  Admin = 'admin',
  Receptionist = 'receptionist',
  Pharmacist = 'pharmacist',
  Doctor = 'doctor',
  Nurse = 'nurse',
  LabTech = 'lab_tech',
  Patient = 'patient',
}

@Entity({ name: 'user' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index('idx_user_email_unique', { unique: true })
  @Column({ type: 'varchar', unique: true })
  email!: string;

  @Column({ type: 'varchar' })
  passwordHash!: string;

  @Column({ type: 'enum', enum: UserRole })
  role!: UserRole;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToOne(() => Staff, (s) => s.user)
  staff?: Staff;

  @OneToOne(() => Patient, (p) => p.user)
  patient?: Patient;
}
