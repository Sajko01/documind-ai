import {
  Module,
} from '@nestjs/common';

import {
  TypeOrmModule,
} from '@nestjs/typeorm';

import {
  SummarizationController,
} from './summarization.controller';

import {
  SummarizationService,
} from './summarization.service';

import {
  Document,
} from '../documents/entities/document.entity';

import {
  DocumentChunk,
} from '../documents/entities/document-chunk.entity';
import { Conversation } from 'src/chat/entities/conversation.entity';
import { Message } from 'src/chat/entities/message.entity';


@Module({

  imports: [
    TypeOrmModule.forFeature([
      Conversation,
      Message,
      Document,
      DocumentChunk,
    ]),
  ],

  controllers: [
    SummarizationController,
  ],

  providers: [
    SummarizationService,
  ],

  exports: [
    SummarizationService,
  ],
})
export class SummarizationModule {}