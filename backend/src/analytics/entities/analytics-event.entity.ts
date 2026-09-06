// import {
//   Column,
//   CreateDateColumn,
//   Entity,
//   JoinColumn,
//   ManyToOne,
//   PrimaryGeneratedColumn,
// } from 'typeorm';

// import { Organization } from '../../organizations/entities/organization.entity';
// import { User } from '../../users/entities/user.entity';


// import { Index } from 'typeorm';
// @Index(['organizationId'])
// @Entity('analytics_events')
// export class AnalyticsEvent {
//   @PrimaryGeneratedColumn('uuid')
//   id!: string;

//   @Column({
//     name: 'organization_id',
//     type: 'uuid',
//   })
//   organizationId!: string;

//   @ManyToOne(() => Organization, {
//     onDelete: 'CASCADE',
//   })
//   @JoinColumn({
//     name: 'organization_id',
//   })
//   organization!: Organization;

//   @Column({
//     name: 'user_id',
//     type: 'uuid',
//     nullable: true,
//   })
//   userId!: string | null;

//   @ManyToOne(() => User, {
//     onDelete: 'SET NULL',
//     nullable: true,
//   })
//   @JoinColumn({
//     name: 'user_id',
//   })
//   user!: User | null;

//   @Column({
//     type: 'varchar',
//     length: 100,
//   })
//   event!: string;

//   @Column({
//     type: 'jsonb',
//     nullable: true,
//   })
//   metadata!: Record<string, unknown> | null;

//   @CreateDateColumn({
//     name: 'created_at',
//   })
//   createdAt!: Date;
// }

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