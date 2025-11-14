import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique, JoinColumn } from 'typeorm';
import { Staff } from './staff.entity';
import { Specialty } from './specialty.entity';

@Entity({ name: 'staff_specialty' })
@Unique('uq_staff_specialty_pair', ['staff', 'specialty'])
export class StaffSpecialty {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Staff, (s) => s.staffSpecialties, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'staffId' })
  staff!: Staff;

  @ManyToOne(() => Specialty, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'specialtyId' })
  specialty!: Specialty;

  @Column({ type: 'boolean', default: false })
  primary!: boolean;
}
