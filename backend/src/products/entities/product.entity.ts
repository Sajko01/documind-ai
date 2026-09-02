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
@Index(['organizationId'])
@Entity('products')
export class Product {
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
    length: 255,
  })
  name!: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description!: string | null;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  price!: string | null;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt!: Date;
}