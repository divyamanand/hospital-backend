import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum RoomType {
  OperationTheatre = 'operation_theatre',
  Consultation = 'consultation',
  ICU = 'icu',
  Ward = 'ward',
  Recovery = 'recovery',
  Lab = 'lab',
}

export enum RoomStatus {
  Available = 'available',
  Occupied = 'occupied',
  Maintenance = 'maintenance',
  Reserved = 'reserved',
}

@Entity({ name: 'room' })
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ type: 'varchar' })
  type!: string;

  @Column({ type: 'varchar', default: 'available' })
  status!: 'available' | 'occupied' | 'maintenance' | 'reserved';

  @Column({ type: 'int', nullable: true })
  capacity!: number | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
