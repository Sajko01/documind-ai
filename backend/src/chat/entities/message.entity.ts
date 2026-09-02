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
  USER = 'USER',
  ASSISTANT = 'ASSISTANT',
  SYSTEM = 'SYSTEM',
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

  @ManyToOne(() => Conversation, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'conversation_id',
  })
  conversation!: Conversation;

  @Column('enum', {
    enum: MessageRole,
  })
  role!: MessageRole;

  @Column({
    type: 'text',
  })
  content!: string;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt!: Date;
}