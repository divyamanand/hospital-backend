import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn } from 'typeorm';
import { Patient } from './patient.entity';
import { Staff } from './staff.entity';
import { PrescriptionItem } from './prescription-item.entity';

@Entity({ name: 'prescription' })
export class Prescription {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patient_id' })
  patient!: Patient;

  @ManyToOne(() => Staff)
  @JoinColumn({ name: 'doctor_id' })
  doctor!: Staff;

  @Column({ type: 'date', nullable: true })
  nextReview!: string | null;

  @Column({ type: 'text', nullable: true })
  diagnosis!: string | null;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @OneToMany(() => PrescriptionItem, (pi) => pi.prescription)
  items!: PrescriptionItem[];
}
