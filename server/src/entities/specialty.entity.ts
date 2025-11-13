import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { StaffSpecialty } from './staff-specialty.entity';

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

  @OneToMany(() => StaffSpecialty, (ss) => ss.specialty)
  staffSpecialties!: StaffSpecialty[];
}
