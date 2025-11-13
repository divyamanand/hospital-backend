import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { UserRole } from './user.entity';

@Entity({ name: 'invitation' })
export class Invitation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index('idx_invitation_token', { unique: true })
  @Column({ type: 'varchar', unique: true })
  token!: string;

  @Column({ type: 'varchar' })
  email!: string;

  @Column({ type: 'enum', enum: UserRole })
  role!: UserRole;

  @Column({ type: 'uuid', nullable: true })
  staffId!: string | null;

  @Column({ type: 'uuid', nullable: true })
  patientId!: string | null;

  @Column({ type: 'timestamp', nullable: true })
  claimedAt!: Date | null;

  @Column({ type: 'uuid', nullable: true })
  claimedByUserId!: string | null;

  @Column({ type: 'timestamp' })
  expiresAt!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
