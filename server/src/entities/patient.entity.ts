import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { Staff } from './staff.entity';
import { User } from './user.entity';

@Entity({ name: 'patient' })
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Staff, { nullable: true })
  @JoinColumn({ name: 'primary_physician_id' })
  primaryPhysician!: Staff | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Link to base user for authentication/authorization
  @OneToOne(() => User, (u: User) => u.patient, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: User | null;
}
