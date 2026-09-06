import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import {
  ConfigService,
} from '@nestjs/config';

import {
  InjectRepository,
} from '@nestjs/typeorm';

import {
  Repository,
} from 'typeorm';

import {
  Document,
} from '../documents/entities/document.entity';

import {
  DocumentChunk,
} from '../documents/entities/document-chunk.entity';
import { Conversation } from 'src/chat/entities/conversation.entity';
import { Message } from 'src/chat/entities/message.entity';


@Injectable()
export class SummarizationService {

  private readonly aiServiceUrl: string;

  constructor(

    @InjectRepository(Document)
    private readonly documentRepository:
      Repository<Document>,

    private readonly configService:
      ConfigService,

    @InjectRepository(DocumentChunk)
    private readonly chunkRepository:
      Repository<DocumentChunk>,

      @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,

  ) {

    this.aiServiceUrl =
      this.configService.get<string>(
        'AI_SERVICE_URL',
      ) || 'http://localhost:8000';
  }


  async generateDocumentSummary(
  documentId: string,
  organizationId: string,
  language = 'en',
) {

  const document =
    await this.documentRepository.findOne({
      where: {
        id: documentId,
        organizationId: organizationId,
      },
    });


  if (!document) {

    throw new NotFoundException(
      'Document does not exist',
    );
  }


  if (document.status !== 'READY') {

    throw new Error(
      'Document is not ready for summarization',
    );
  }


  const chunks =
    await this.chunkRepository.find({
      where: {
        documentId: document.id,
      },

      order: {
        pageNumber: 'ASC',
      },
    });


  if (!chunks.length) {

    throw new Error(
      'Document contains no processed content',
    );
  }


  const content = chunks
    .map(chunk => chunk.content)
    .join('\n\n');


  try {

    const response =
      await fetch(
        `${this.aiServiceUrl}/ai/generate-document-summary`,
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify({

            document_id:
              document.id,

            content:
              content,

            language:
              language,
          }),
        },
      );


    if (!response.ok) {

      throw new Error(
        `AI service returned ${response.status}`,
      );
    }


    return await response.json();

  } catch (error) {

    console.error(
      'Document summarization failed:',
      error,
    );

    throw new InternalServerErrorException(
      'Failed to generate document summary',
    );
  }
}

async generateConversationSummary(
    conversationId: string,
    organizationId: string,
    language = 'en',
  ) {
    // KORAK 24 — Conversation ownership
    const conversation = await this.conversationRepository.findOne({
      where: {
        id: conversationId,
        organizationId,
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation does not exist');
    }

    // KORAK 25 — Messages
    const messages = await this.messageRepository.find({
      where: {
        conversationId: conversation.id,
      },
      order: {
        createdAt: 'ASC', // Proveri da li je createdAt ili created_at u tvom Message Entity-ju
      },
    });

    // KORAK 26 — Napravi conversation content
    const content = messages
      .map(message => {
        return `${message.role}: ${message.content}`;
      })
      .join('\n\n');

    // KORAK 27 — Pozovi Python
    try {
      const response = await fetch(
        `${this.aiServiceUrl}/ai/generate-conversation-summary`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            conversation_id: conversation.id,
            content: content,
            language: language,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`AI service returned ${response.status}`);
      }

      return await response.json();
    } catch (error: any) { // 👈 Dodato ': any' da se reši TypeScript greška za unknown tip
      throw new Error(`Failed to generate conversation summary: ${error.message}`);
    }
  }

}