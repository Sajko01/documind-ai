import 'dotenv/config';
import 'reflect-metadata';


import { DataSource } from 'typeorm';

import { Organization } from '../organizations/entities/organization.entity';
import { User } from '../users/entities/user.entity';
import { Document } from '../documents/entities/document.entity';
import { DocumentChunk } from 'src/documents/entities/document-chunk.entity';
import { Conversation } from 'src/chat/entities/conversation.entity';
import { Message } from 'src/chat/entities/message.entity';
import { Product } from 'src/products/entities/product.entity';
import { Offer } from 'src/offers/entities/offer.entity';
import { AnalyticsEvent } from 'src/analytics/entities/analytics-event.entity';

export default new DataSource({
  type: 'postgres',

  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),

  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,

  database: process.env.DATABASE_NAME,

  entities: [
    Organization,
    User,
    Document,
    DocumentChunk,
    Conversation,
    Message,
    Product,
    Offer,
    AnalyticsEvent,
  ],

  migrations: [
  'src/database/migrations/*{.ts,.js}',
  'src/migrations/*{.ts,.js}', // 👈 Dodata i ova putanja
],
});