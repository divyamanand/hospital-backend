import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ name: 'audit_log' })
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  entityType!: string;

  @Column()
  entityId!: string;

  @Column()
  action!: string;

  @Column({ type: 'varchar', nullable: true })
  performedBy!: string | null;

  @Column({ type: 'json', nullable: true })
  payload!: any | null;

  @CreateDateColumn()
  createdAt!: Date;
}
