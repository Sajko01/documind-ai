import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Organization } from '../../organizations/entities/organization.entity';

@Entity('products')
@Index(['organizationId'])
@Index(['organizationId', 'sku'], { unique: true })
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
    length: 100,
  })
  sku!: string;

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
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  category!: string | null;

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
  })
  price!: number;

  @Column({
    type: 'integer',
    default: 0,
  })
  stock!: number;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'piece',
  })
  unit!: string;

  @Column({
    type: 'boolean',
    default: true,
  })
  active!: boolean;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt!: Date;
}