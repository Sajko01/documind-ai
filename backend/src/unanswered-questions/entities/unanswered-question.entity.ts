import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Index,
} from 'typeorm';
import { UnansweredQuestionStatus } from '../enums/unanswered-question-status.enum';


@Entity('unanswered_questions')
@Index([
  'organizationId',
  'createdAt',
])
export class UnansweredQuestion {

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
  })
  userId!: string;


  @Column({
    name: 'conversation_id',
    type: 'uuid',
    nullable: true,
  })
  conversationId!: string | null;


  @Column({
    name: 'message_id',
    type: 'uuid',
    nullable: true,
  })
  messageId!: string | null;


  @Column({
    type: 'text',
  })
  question!: string;


  @Column({
    type: 'float',
    nullable: true,
  })
  confidence!: number | null;


//   @Column({
//     name: 'status',
//     type: 'varchar',
//     default: 'OPEN',
//   })
//   status!: string;


  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt!: Date;

  @Column({
  type: 'enum',
  enum: UnansweredQuestionStatus,
  default: UnansweredQuestionStatus.OPEN,
})
    status!: UnansweredQuestionStatus;
}