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
  roomNumber!: string;

  @Column({ type: 'enum', enum: RoomType })
  type!: RoomType;

  @Column({ type: 'enum', enum: RoomStatus, default: RoomStatus.Available })
  status!: RoomStatus;

  @Column({ type: 'int', nullable: true })
  capacity!: number | null;

  @Column({ type: 'json', nullable: true })
  features!: any | null;

  @Column({ type: 'varchar', nullable: true })
  currentPatientId!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
