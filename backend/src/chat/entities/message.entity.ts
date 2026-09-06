import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Conversation } from './conversation.entity';

export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
}

@Index(['conversationId', 'createdAt'])
@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    name: 'conversation_id',
    type: 'uuid',
  })
  conversationId!: string;

  @ManyToOne(() => Conversation, (conversation) => conversation.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'conversation_id',
  })
  conversation!: Conversation;

  @Column({
    type: 'enum',
    enum: MessageRole,
  })
  role!: MessageRole;

  @Column({
    type: 'text',
  })
  content!: string;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  sources!: Record<string, any>[] | null;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt!: Date;

  // OVO JE FALIČNO - dodaj ova dva polja da TypeORM ne bi bacao grešku:
  @Column({ type: 'float', nullable: true })
  confidence?: number;

  @Column({ type: 'boolean', default: true })
  answered?: boolean;
}