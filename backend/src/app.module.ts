// import { Module } from '@nestjs/common';
// import { AppController } from './app.controller';
// import { AppService } from './app.service';
// import { AuthModule } from './auth/auth.module';
// import { UsersModule } from './users/users.module';
// import { OrganizationsModule } from './organizations/organizations.module';
// import { DocumentsModule } from './documents/documents.module';
// import { ChatModule } from './chat/chat.module';
// import { ProductsModule } from './products/products.module';
// import { OffersModule } from './offers/offers.module';
// import { AnalyticsModule } from './analytics/analytics.module';

// @Module({
//   imports: [AuthModule, UsersModule, OrganizationsModule, DocumentsModule, ChatModule, ProductsModule, OffersModule, AnalyticsModule],
//   controllers: [AppController],
//   providers: [AppService],
// })
// export class AppModule {}


// import { Module } from '@nestjs/common';
// import { ConfigModule } from '@nestjs/config';

// import { AuthModule } from './auth/auth.module';
// import { UsersModule } from './users/users.module';
// import { OrganizationsModule } from './organizations/organizations.module';
// import { DocumentsModule } from './documents/documents.module';
// import { ChatModule } from './chat/chat.module';
// import { ProductsModule } from './products/products.module';
// import { OffersModule } from './offers/offers.module';
// import { AnalyticsModule } from './analytics/analytics.module';

// @Module({
//   imports: [
//     ConfigModule.forRoot({
//       isGlobal: true,
//     }),

//     AuthModule,
//     UsersModule,
//     OrganizationsModule,
//     DocumentsModule,
//     ChatModule,
//     ProductsModule,
//     OffersModule,
//     AnalyticsModule,
//   ],
// })
// export class AppModule {}

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import databaseConfig from './database/database.config';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { DocumentsModule } from './documents/documents.module';
import { ChatModule } from './chat/chat.module';
import { ProductsModule } from './products/products.module';
import { OffersModule } from './offers/offers.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { Document } from './documents/entities/document.entity';

import { DocumentChunk } from './documents/entities/document-chunk.entity';

import { Conversation } from './chat/entities/conversation.entity';
import { Message } from './chat/entities/message.entity';

import { Product } from './products/entities/product.entity';
import { Offer } from './offers/entities/offer.entity';

import { AnalyticsEvent } from './analytics/entities/analytics-event.entity';

import { Organization } from './organizations/entities/organization.entity';
import { User } from './users/entities/user.entity';
import { OfferItem } from './offers/entities/offer-item.entity';
import { EmailModule } from './email_generation/email.module';
import {
  SummarizationModule,
} from './summarization/summarization.module';
import { FeedbackModule } from './feedback/feedback.module';
import { Feedback } from './feedback/entities/feedback.entity';
import { UnansweredQuestionsModule } from './unanswered-questions/unanswered-questions.module';
import { UnansweredQuestion } from './unanswered-questions/entities/unanswered-question.entity';
//import { InstagramModule } from './instagram/instagram.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],

      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.database'),

        entities: [
          Organization,
          User,
          Document,
          DocumentChunk,
          Conversation,
          Message,
          Product,
          Offer,
          OfferItem,
          AnalyticsEvent,
          Feedback,
          UnansweredQuestion
         
        ],

        synchronize: false,
      }),
    }),

    AuthModule,
    UsersModule,
    OrganizationsModule,
    DocumentsModule,
    ChatModule,
    ProductsModule,
    OffersModule,
    AnalyticsModule,
    EmailModule,
    SummarizationModule,
    FeedbackModule,
     UnansweredQuestionsModule,
    // InstagramModule,
  ],
})
export class AppModule {}