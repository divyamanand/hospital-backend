import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum RoomType {
  Consultation = 'consultation',
  Surgery = 'surgery',
  ICU = 'icu',
  Ward = 'ward',
  Lab = 'lab',
  Storage = 'storage',
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

  @Column({ type: 'enum', enum: RoomType })
  type!: RoomType;

  @Column({ type: 'enum', enum: RoomStatus, default: RoomStatus.Available })
  status!: RoomStatus;

  @Column({ type: 'int', nullable: true })
  capacity!: number | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
