import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Document } from './document.entity';

import { Index } from 'typeorm';
@Index(['documentId'])
@Entity('document_chunks')
export class DocumentChunk {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    name: 'document_id',
    type: 'uuid',
  })
  documentId!: string;

  @ManyToOne(() => Document, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'document_id',
  })
  document!: Document;

  @Column({
    name: 'chunk_index',
    type: 'int',
  })
  chunkIndex!: number;

  @Column({
    type: 'text',
  })
  content!: string;
}