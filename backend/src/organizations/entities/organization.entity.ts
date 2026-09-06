import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Document } from '../../documents/entities/document.entity';

//import { User } from '../../users/entities/user.entity';
import { User } from 'src/users/entities/user.entity';
import { Conversation } from 'src/chat/entities/conversation.entity';
import { Product } from 'src/products/entities/product.entity';
import { Offer } from 'src/offers/entities/offer.entity';
import { AnalyticsEvent } from 'src/analytics/entities/analytics-event.entity';

@Entity('organizations')
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @OneToMany(() => User, (user) => user.organization)
  users!: User[];

  @OneToMany(() => Document, (document) => document.organization)
  documents!: Document[];


  @OneToMany(() => Conversation, (conversation) => conversation.organization)
  conversations!: Conversation[];

  @OneToMany(() => Product, (product) => product.organization)
  products!: Product[];

  @OneToMany(() => Offer, (offer) => offer.organization)
  offers!: Offer[];

  @OneToMany(() => AnalyticsEvent, (event) => event.organizationId) // ili kako već mapiraš relaciju
  analyticsEvents!: AnalyticsEvent[];
}