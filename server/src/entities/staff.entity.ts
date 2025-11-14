import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { Specialty } from './specialty.entity';
import { StaffSpecialty } from './staff-specialty.entity';
import { Timings } from './timings.entity';
import { Leave } from './leave.entity';
import { User } from './user.entity';

@Entity({ name: 'staff' })
export class Staff {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

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
  @JoinColumn({ name: 'userId' })
  user?: User | null;
}
