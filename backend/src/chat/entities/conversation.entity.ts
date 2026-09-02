import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Organization } from '../../organizations/entities/organization.entity';
import { User } from '../../users/entities/user.entity';

import { Index } from 'typeorm';
@Index(['organizationId'])
@Entity('conversations')
export class Conversation {
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
    name: 'user_id',
    type: 'uuid',
  })
  userId!: string;

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'user_id',
  })
  user!: User;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  title!: string | null;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt!: Date;
}