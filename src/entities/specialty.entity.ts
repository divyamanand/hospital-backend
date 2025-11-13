import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn, ManyToMany } from 'typeorm';
import { Staff } from './staff.entity';

@Entity({ name: 'specialty' })
export class Specialty {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index('idx_specialty_code', { unique: true })
  @Column({ unique: true })
  code!: string;

  @Column()
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToMany(() => Staff, (s) => s.specialties)
  staff!: Staff[];
}
