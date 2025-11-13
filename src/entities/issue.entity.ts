import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Specialty } from './specialty.entity';

export enum IssueSeverity {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
  Critical = 'critical',
}

@Entity({ name: 'issue' })
export class Issue {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index('idx_issue_code', { unique: true })
  @Column({ type: 'varchar', nullable: true, unique: true })
  code!: string | null;

  @Column({ type: 'varchar' })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @ManyToOne(() => Specialty, { nullable: true })
  @JoinColumn({ name: 'mapped_specialty_id' })
  mappedSpecialty!: Specialty | null;

  @Column({ type: 'enum', enum: IssueSeverity, nullable: true })
  severity!: IssueSeverity | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
