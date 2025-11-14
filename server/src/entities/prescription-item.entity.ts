import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Prescription } from './prescription.entity';

@Entity({ name: 'prescription_item' })
export class PrescriptionItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Prescription, (p) => p.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'prescriptionId' })
  prescription!: Prescription;

  @Column()
  name!: string;

  @Column()
  dosage!: string; // e.g., 500mg

  @Column()
  duration!: string; // e.g., 5 days

  @Column({ type: 'int' })
  quantity!: number;

  @Column({ type: 'varchar', nullable: true })
  dayDivide!: string | null; // e.g., 101, 001, 111

  @Column({ type: 'varchar', nullable: true })
  method!: string | null; // before food | after food

  @Column({ type: 'timestamp', nullable: true })
  createdAt!: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  updatedAt!: Date | null;
}
