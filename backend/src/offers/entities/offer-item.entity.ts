import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Offer } from './offer.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('offer_items')
export class OfferItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // ❌ OBRISANO: offerId kolona više ne treba ovde jer je menja relacija ispod!

  @Column({
    name: 'product_id',
    type: 'uuid',
  })
  productId!: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  productName!: string;

  @Column({
    type: 'varchar',
    length: 100,
  })
  sku!: string;

  @Column({
    type: 'integer',
  })
  quantity!: number;

  @Column({
    name: 'unit_price',
    type: 'numeric',
    precision: 12,
    scale: 2,
  })
  unitPrice!: number;

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
  })
  subtotal!: number;

  @ManyToOne(
    () => Offer,
    (offer) => offer.items,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'offer_id', // 👈 Ova relacija automatski upravlja 'offer_id' kolonom u bazi!
  })
  offer!: Offer;

  @ManyToOne(
    () => Product,
    {
      nullable: false,
    },
  )
  @JoinColumn({
    name: 'product_id',
  })
  product!: Product;
}