import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Organization } from '../../organizations/entities/organization.entity';
import { User } from '../../users/entities/user.entity';


import { Index } from 'typeorm';
@Index(['organizationId'])
@Entity('analytics_events')
export class AnalyticsEvent {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    name: 'organization_id',
    type: 'uuid',
  })
  organizationId!: string;

  @ManyToOne(() => Organization, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'organization_id',
  })
  organization!: Organization;

  @Column({
    name: 'user_id',
    type: 'uuid',
    nullable: true,
  })
  userId!: string | null;

  @ManyToOne(() => User, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({
    name: 'user_id',
  })
  user!: User | null;

  @Column({
    type: 'varchar',
    length: 100,
  })
  event!: string;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  metadata!: Record<string, unknown> | null;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt!: Date;
}