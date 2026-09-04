import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Organization } from '../../organizations/entities/organization.entity';
import { OfferItem } from './offer-item.entity';
import { OfferStatus } from './offer-status.enum';

@Index(['organizationId'])
@Entity('offers')
export class Offer {
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
    name: 'offer_number',
    type: 'varchar',
    length: 100,
    unique: true,
  })
  offerNumber!: string;

  @Column({
    name: 'customer_name',
    type: 'varchar',
    length: 255,
  })
  customerName!: string;

  @Column({
    name: 'customer_email',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  customerEmail?: string | null;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  subtotal!: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  total!: number;

  @Column({
    type: 'varchar',
    length: 3,
    default: 'EUR',
  })
  currency!: string;



  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  validUntil!: Date | null;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt!: Date;

  @OneToMany(
    () => OfferItem,
    (item) => item.offer,
    {
      cascade: true,
    },
  )
  items!: OfferItem[];

  @Column({
  type: 'enum',
  enum: OfferStatus,
  default: OfferStatus.DRAFT, 
  })
  status!: OfferStatus;
}