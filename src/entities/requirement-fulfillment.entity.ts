import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Requirement } from './requirement.entity';

@Entity({ name: 'requirement_fulfillment' })
export class RequirementFulfillment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Requirement, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'requirement_id' })
  requirement!: Requirement;

  @Column({ nullable: true })
  fulfilledById!: string | null;

  @Column({ type: 'timestamp', nullable: true })
  fulfilledAt!: Date | null;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;
}
