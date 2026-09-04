

// // // import {
// // //   Column,
// // //   CreateDateColumn,
// // //   Entity,
// // //   JoinColumn,
// // //   ManyToOne,
// // //   PrimaryGeneratedColumn,
// // // } from 'typeorm';

// // // import { Organization } from '../../organizations/entities/organization.entity';
// // // import { Index } from 'typeorm';


// // // export enum DocumentStatus {
// // //   UPLOADED = 'UPLOADED',
// // //   PROCESSING = 'PROCESSING',
// // //   READY = 'READY',
// // //   FAILED = 'FAILED',
// // // }
// // // @Index(['organizationId'])
// // // @Entity('documents')
// // // export class Document {
// // //   @PrimaryGeneratedColumn('uuid')
// // //   id!: string;

// // //   @Column({
// // //     name: 'organization_id',
// // //     type: 'uuid',
// // //   })
// // //   organizationId!: string;

// // //   @ManyToOne(() => Organization, {
// // //     onDelete: 'CASCADE',
// // //   })
// // //   @JoinColumn({
// // //     name: 'organization_id',
// // //   })
// // //   organization!: Organization;

// // //   @Column({
// // //     type: 'varchar',
// // //     length: 500,
// // //   })
// // //   filename!: string;

// // //   @Column({
// // //     name: 'original_name',
// // //     type: 'varchar',
// // //     length: 500,
// // //   })
// // //   originalName!: string;

// // //   @Column({
// // //     name: 'mime_type',
// // //     type: 'varchar',
// // //     length: 100,
// // //   })
// // //   mimeType!: string;

// // //   @Column({
// // //     type: 'bigint',
// // //   })
// // //   size!: string;

// // //   @Column({
// // //     type: 'enum',
// // //     enum: DocumentStatus,
// // //     default: DocumentStatus.UPLOADED,
// // //   })
// // //   status!: DocumentStatus;

// // //   @CreateDateColumn({
// // //     name: 'created_at',
// // //   })
// // //   createdAt!: Date;
// // // }
// // import {
// //   Column,
// //   CreateDateColumn,
// //   Entity,
// //   Index,
// //   JoinColumn,
// //   ManyToOne,
// //   PrimaryGeneratedColumn,
// //   UpdateDateColumn,
// // } from 'typeorm';

// // import { Organization } from '../../organizations/entities/organization.entity';
// // import { User } from '../../users/entities/user.entity';

// // export enum DocumentStatus {
// //   UPLOADED = 'UPLOADED',
// //   PROCESSING = 'PROCESSING',
// //   READY = 'READY',
// //   FAILED = 'FAILED',
// // }

// // @Index(['organizationId'])
// // @Index(['createdById'])
// // @Entity('documents')
// // export class Document {
// //   @PrimaryGeneratedColumn('uuid')
// //   id!: string;

// //   @Column({
// //     type: 'varchar',
// //     length: 255,
// //     nullable: true,
// //   })
// //   title?: string;

// //   @Column({
// //     type: 'text',
// //     nullable: true,
// //   })
// //   content?: string;

// //   // 1. Organization mapping
// //   @Column({
// //     name: 'organization_id',
// //     type: 'uuid',
// //   })
// //   organizationId!: string;

// //   @ManyToOne(() => Organization, {
// //     onDelete: 'CASCADE',
// //   })
// //   @JoinColumn({
// //     name: 'organization_id',
// //   })
// //   organization!: Organization;

// //   // 2. User Creator mapping (dodato da reši TS2769 grešku)
// //   @Column({
// //     name: 'created_by_id',
// //     type: 'uuid',
// //   })
// //   createdById!: string;

// //   @ManyToOne(() => User, {
// //     onDelete: 'CASCADE',
// //   })
// //   @JoinColumn({
// //     name: 'created_by_id',
// //   })
// //   createdBy!: User;

// //   @Column({
// //     type: 'varchar',
// //     length: 500,
// //     nullable: true,
// //   })
// //   filename?: string;

// //   @Column({
// //     name: 'original_name',
// //     type: 'varchar',
// //     length: 500,
// //     nullable: true,
// //   })
// //   originalName?: string;

// //   @Column({
// //     name: 'mime_type',
// //     type: 'varchar',
// //     length: 100,
// //     nullable: true,
// //   })
// //   mimeType?: string;

// //   @Column({
// //     type: 'bigint',
// //     nullable: true,
// //   })
// //   size?: string;

// //   @Column({
// //     type: 'enum',
// //     enum: DocumentStatus,
// //     default: DocumentStatus.UPLOADED,
// //   })
// //   status!: DocumentStatus;

// //   @CreateDateColumn({
// //     name: 'created_at',
// //   })
// //   createdAt!: Date;

// //   @UpdateDateColumn({
// //     name: 'updated_at',
// //   })
// //   updatedAt!: Date;
// // }
// import {
//   Column,
//   CreateDateColumn,
//   Entity,
//   Index,
//   JoinColumn,
//   ManyToOne,
//   PrimaryGeneratedColumn,
//   UpdateDateColumn,
// } from 'typeorm';

// import { Organization } from '../../organizations/entities/organization.entity';
// import { User } from '../../users/entities/user.entity';

// export enum DocumentStatus {
//   UPLOADED = 'UPLOADED',
//   PROCESSING = 'PROCESSING',
//   READY = 'READY',
//   FAILED = 'FAILED',
// }

// @Index(['organizationId'])
// @Index(['createdById'])
// @Entity('documents')
// export class Document {
//   @PrimaryGeneratedColumn('uuid')
//   id!: string;

//   @Column({
//     type: 'varchar',
//     length: 255,
//     nullable: true,
//   })
//   title?: string;

//   @Column({
//     type: 'text',
//     nullable: true,
//   })
//   content?: string;

//   // 1. Organization Relation & Foreign Key
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

//   // 2. Creator User Relation & Foreign Key
//   @Column({
//     name: 'created_by_id',
//     type: 'uuid',
//   })
//   createdById!: string;

//   @ManyToOne(() => User, {
//     onDelete: 'CASCADE',
//   })
//   @JoinColumn({
//     name: 'created_by_id',
//   })
//   createdBy!: User;

//   // 3. File metadata (nullable za tekstualne dokumente)
//   @Column({
//     type: 'varchar',
//     length: 500,
//     nullable: true,
//   })
//   filename?: string;

//   @Column({
//     name: 'original_name',
//     type: 'varchar',
//     length: 500,
//     nullable: true,
//   })
//   originalName?: string;

//   @Column({
//     name: 'mime_type',
//     type: 'varchar',
//     length: 100,
//     nullable: true,
//   })
//   mimeType?: string;

//   @Column({
//     type: 'bigint',
//     nullable: true,
//   })
//   size?: string;

//   // 4. Status i Timestamps
//   @Column({
//     type: 'enum',
//     enum: DocumentStatus,
//     default: DocumentStatus.UPLOADED,
//   })
//   status!: DocumentStatus;

//   @CreateDateColumn({
//     name: 'created_at',
//   })
//   createdAt!: Date;

//   @UpdateDateColumn({
//     name: 'updated_at',
//   })
//   updatedAt!: Date;
// }

import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Organization } from '../../organizations/entities/organization.entity';
import { User } from '../../users/entities/user.entity';

export enum DocumentStatus {
  UPLOADED = 'UPLOADED',
  PROCESSING = 'PROCESSING',
  READY = 'READY',
  FAILED = 'FAILED',
}

@Index(['organizationId'])
@Index(['createdById'])
@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // 1. Podrška za tekstualne dokumente
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  title?: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  content?: string;

  // 2. Organization mapping (sa inverznom relacijom)
  @Column({
    name: 'organization_id',
    type: 'uuid',
  })
  organizationId!: string;

  @ManyToOne(
    () => Organization,
    (organization) => organization.documents, // 👈 Dodat inverzni relacioni pokazivač
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'organization_id',
  })
  organization!: Organization;

  // 3. User Creator mapping
  @Column({
    name: 'created_by_id',
    type: 'uuid',
  })
  createdById!: string;

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'created_by_id',
  })
  createdBy!: User;

  // 4. File metadata & Putanja na skladištu (Nullable za text-only opciju)
  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  filename?: string;

  @Column({
    name: 'original_name',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  originalName?: string;

  @Column({
    name: 'mime_type',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  mimeType?: string;

  @Column({
    type: 'bigint',
    nullable: true,
  })
  size?: string;

  @Column({
    name: 'storage_path', // 👈 Novo polje iz novog zahteva
    type: 'varchar',
    length: 1000,
    nullable: true,
  })
  storagePath?: string;

  // 5. Status i Timestamps
  @Column({
    type: 'enum',
    enum: DocumentStatus,
    default: DocumentStatus.UPLOADED,
  })
  status!: DocumentStatus;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt!: Date;

  @Column({
  name: 'extracted_text',
  type: 'text',
  nullable: true,
  })
  extractedText!: string | null;

  @Column({
  name: 'page_count',
  type: 'integer',
  nullable: true,
  })
  pageCount!: number | null;
}