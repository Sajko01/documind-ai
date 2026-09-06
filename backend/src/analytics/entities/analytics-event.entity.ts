

import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

import {
  AnalyticsEventType,
} from '../enums/analytics-event-type.enum';


@Entity('analytics_events')
export class AnalyticsEvent {

  @PrimaryGeneratedColumn('uuid')
  id!: string;


  @Column({
    name: 'organization_id',
    type: 'uuid',
  })
  organizationId!: string;


  @Column({
    name: 'user_id',
    type: 'uuid',
    nullable: true,
  })
  userId!: string | null;


  @Column({
    name: 'event_type',
    type: 'varchar',
  })
  eventType!: AnalyticsEventType;


  @Column({
    name: 'document_id',
    type: 'uuid',
    nullable: true,
  })
  documentId!: string | null;


  @Column({
    name: 'conversation_id',
    type: 'uuid',
    nullable: true,
  })
  conversationId!: string | null;


  @Column({
    name: 'response_time_ms',
    type: 'integer',
    nullable: true,
  })
  responseTimeMs!: number | null;


  @Column({
    name: 'retrieval_score',
    type: 'double precision',
    nullable: true,
  })
  retrievalScore!: number | null;


  @Column({
    type: 'jsonb',
    nullable: true,
  })
  metadata!: Record<string, any> | null;


  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt!: Date;
}