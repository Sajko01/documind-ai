// import { Module } from '@nestjs/common';
// import { ChatController } from './chat.controller';
// import { ChatService } from './chat.service';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { Conversation } from './entities/conversation.entity';
// import { Message } from './entities/message.entity';
// import { HttpModule } from '@nestjs/axios';
// import { DocumentChunk } from 'src/documents/entities/document-chunk.entity';






// @Module({
//   imports: [
//     TypeOrmModule.forFeature([
//       Conversation,
//       Message,
//       DocumentChunk,
//     ]),
//        HttpModule,
//   ],
//   controllers: [ChatController],
//   providers: [ChatService],
//   exports: [ChatService],
// })
// export class ChatModule {}

import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';

import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { DocumentChunk } from 'src/documents/entities/document-chunk.entity';

// 70.5. Imports za Products i ProductToolsService
import { ProductsModule } from '../products/products.module';
import { ProductToolsService } from './tools/product-tools.service';
import { OffersModule } from 'src/offers/offers.module';
import { OfferToolsService } from './tools/offer-tools.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Conversation,
      Message,
      DocumentChunk,
      ProductsModule,
      OffersModule,
    ]),
    HttpModule,
    ProductsModule, // Dodato iz 70.5

    forwardRef(() => OffersModule),
  ],
  controllers: [ChatController],
  providers: [
    ChatService,
    ProductToolsService, // Dodato iz 70.5
    OfferToolsService,
  ],
  exports: [
    ChatService,
    ProductToolsService, // Dodato iz 70.5
    OfferToolsService,
  ],
})
export class ChatModule {}