import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToMany,
  JoinTable,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Specialty } from './specialty.entity';
import { StaffSpecialty } from './staff-specialty.entity';
import { Timings } from './timings.entity';
import { Leave } from './leave.entity';
import { User } from './user.entity';

export enum StaffRole {
  Doctor = 'doctor',
  Nurse = 'nurse',
  Receptionist = 'receptionist',
  Admin = 'admin',
  LabTech = 'lab_tech',
  Pharmacist = 'pharmacist',
}

export enum StaffStatus {
  Active = 'active',
  Inactive = 'inactive',
  Suspended = 'suspended',
}

export enum WorkType {
  FullTime = 'fulltime',
  PartTime = 'parttime',
  Contract = 'contract',
}

export enum Gender {
  Male = 'male',
  Female = 'female',
  Other = 'other',
}

@Entity({ name: 'staff' })
export class Staff {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  firstName!: string;

  @Column({ nullable: true })
  lastName!: string;

  // Email is now on User entity

  @Index('idx_staff_phone', { unique: true })
  @Column({ type: 'varchar', nullable: true, unique: true })
  phone!: string | null;

  @Index('idx_staff_employee_id', { unique: true })
  @Column({ type: 'varchar', nullable: true, unique: true })
  employeeId!: string | null;

  @Column({ type: 'varchar', nullable: true })
  designation!: string | null;

  @Column({ type: 'text', nullable: true })
  qualifications!: string | null;

  @Column({ type: 'enum', enum: Gender, nullable: true })
  gender!: Gender | null;

  @Column({ type: 'date', nullable: true })
  dateOfBirth!: string | null;

  @Column({ type: 'date', nullable: true })
  joiningDate!: string | null;

  @Column({ type: 'enum', enum: StaffRole })
  role!: StaffRole;

  @Column({ type: 'enum', enum: StaffStatus, default: StaffStatus.Active })
  status!: StaffStatus;

  @Column({ type: 'enum', enum: WorkType, nullable: true })
  workType!: WorkType | null;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @Column({ default: false })
  isDeleted!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => StaffSpecialty, (ss) => ss.staff)
  staffSpecialties!: StaffSpecialty[];

  @OneToMany(() => Timings, (t) => t.staff)
  timings!: Timings[];

  @OneToMany(() => Leave, (l) => l.staff)
  leaves!: Leave[];

  // Link to base user for authentication/authorization
  @OneToOne(() => User, (u: User) => u.staff, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: User | null;
}
