// import {
//   Column,
//   Entity,
//   JoinColumn,
//   ManyToOne,
//   PrimaryGeneratedColumn,
// } from 'typeorm';

// import { Document } from './document.entity';

// import { Index } from 'typeorm';
// @Index(['documentId'])
// @Entity('document_chunks')
// export class DocumentChunk {
//   @PrimaryGeneratedColumn('uuid')
//   id!: string;

//   @Column({
//     name: 'document_id',
//     type: 'uuid',
//   })
//   documentId!: string;

//   @ManyToOne(() => Document, {
//     onDelete: 'CASCADE',
//   })
//   @JoinColumn({
//     name: 'document_id',
//   })
//   document!: Document;

//   @Column({
//     name: 'chunk_index',
//     type: 'int',
//   })
//   chunkIndex!: number;

//   @Column({
//     type: 'text',
//   })
//   content!: string;
// }

import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Document } from './document.entity';

@Entity('document_chunks')
@Index('idx_document_chunks_document_id', ['documentId'])
@Index('idx_document_chunks_document_page', ['documentId', 'pageNumber'])
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
    name: 'page_number',
    type: 'integer',
  })
  pageNumber!: number;

  @Column({
    name: 'chunk_index',
    type: 'integer',
  })
  chunkIndex!: number;

  @Column({
    type: 'text',
  })
  content!: string;

  @Column({
    name: 'token_count',
    type: 'integer',
  })
  tokenCount!: number;

  @Column({
  type: 'vector',
  length: 384,
  nullable: true,
  })
  embedding!: number[] | null;

   @Column({
    type: 'jsonb',
    nullable: true,
  })
  metadata!: Record<string, any> | null;
}