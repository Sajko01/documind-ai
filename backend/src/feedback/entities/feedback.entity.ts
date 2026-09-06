import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

import {
  FeedbackRating,
} from '../enums/feedback-rating.enum';

@Index([
  'organizationId',
  'createdAt',
])
@Index(
  [
    'messageId',
    'userId',
  ],
  {
    unique: true,
  },
)
@Entity('feedback')
export class Feedback {

  @PrimaryGeneratedColumn('uuid')
  id!: string;


  @Column({
    name: 'organization_id',
    type: 'uuid',
  })
  organizationId!: string;


  @Column({
    name: 'message_id',
    type: 'uuid',
  })
  messageId!: string;


  @Column({
    name: 'user_id',
    type: 'uuid',
  })
  userId!: string;


  @Column({
    type: 'enum',
    enum: FeedbackRating,
  })
  rating!: FeedbackRating;


  @Column({
    type: 'varchar',
    nullable: true,
  })
  reason!: string | null;


  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt!: Date;
}