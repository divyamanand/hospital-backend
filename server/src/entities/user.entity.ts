import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, OneToOne } from 'typeorm';
import { Staff } from './staff.entity';
import { Patient } from './patient.entity';

export enum UserRole {
  Admin = 'admin',
  Receptionist = 'receptionist',
  Pharmacist = 'pharmacist',
  Inventory = 'inventory',
  Doctor = 'doctor',
  Nurse = 'nurse',
  LabTech = 'lab_tech',
  RoomManager = 'room_manager',
  Patient = 'patient',
}

export enum UserType {
  Staff = 'staff',
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

  @Column({ type: 'varchar', nullable: true })
  firstName!: string | null;

  @Column({ type: 'varchar', nullable: true })
  lastName!: string | null;

  @Column({ type: 'date', nullable: true })
  dateOfBirth!: string | null;

  @Column({ type: 'varchar', nullable: true })
  gender!: string | null;

  @Index('idx_user_phone', { unique: false })
  @Column({ type: 'varchar', nullable: true })
  phone!: string | null;

  @Column({ type: 'enum', enum: UserRole })
  role!: UserRole;

  @Column({ type: 'enum', enum: UserType, default: UserType.Patient })
  type!: UserType;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToOne(() => Staff, (s) => s.user)
  staff?: Staff;

  @OneToOne(() => Patient, (p) => p.user)
  patient?: Patient;
}
