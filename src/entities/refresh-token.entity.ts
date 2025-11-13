import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity({ name: 'refresh_token' })
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index('idx_refresh_user')
  @Column({ type: 'varchar' })
  userId!: string; // patient.id or staff.id

  @Column({ type: 'varchar' })
  userRole!: string; // 'patient' | 'doctor' | 'admin' | ...

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
