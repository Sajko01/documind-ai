

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Organization } from '../../organizations/entities/organization.entity';
import { Index } from 'typeorm';


export enum DocumentStatus {
  UPLOADED = 'UPLOADED',
  PROCESSING = 'PROCESSING',
  READY = 'READY',
  FAILED = 'FAILED',
}
@Index(['organizationId'])
@Entity('documents')
export class Document {
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
    type: 'varchar',
    length: 500,
  })
  filename!: string;

  @Column({
    name: 'original_name',
    type: 'varchar',
    length: 500,
  })
  originalName!: string;

  @Column({
    name: 'mime_type',
    type: 'varchar',
    length: 100,
  })
  mimeType!: string;

  @Column({
    type: 'bigint',
  })
  size!: string;

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
}