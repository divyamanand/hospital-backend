import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';
import { UserRole } from './user.entity';

@Entity({ name: 'refresh_token' })
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index('idx_refresh_user')
  @Column({ type: 'varchar' })
  userId!: string; // patient.id or staff.id

  @Column({ type: 'enum', enum: UserRole })
  userRole!: UserRole; // constrained to UserRole values

  @Index('idx_refresh_hash', { unique: true })
  @Column({ type: 'varchar' })
  tokenHash!: string; // sha256(refreshToken)

  @Column({ type: 'timestamp' })
  expiresAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  revokedAt!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;
}
