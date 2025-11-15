import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { RoomRequirement } from './room-requirement.entity';
import { Room } from './room.entity';

@Entity({ name: 'room_requirement_fulfillment' })
export class RoomRequirementFulfillment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => RoomRequirement, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'requirementId' })
  requirement!: RoomRequirement;

  @ManyToOne(() => Room, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'roomId' })
  room!: Room;

  @Column({ type: 'timestamp', nullable: true })
  startAt!: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  endAt!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
