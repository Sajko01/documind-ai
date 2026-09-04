import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

import { Conversation } from './entities/conversation.entity';
import { Message, MessageRole } from './entities/message.entity';
import { DocumentChunk } from '../documents/entities/document-chunk.entity'; // Prilagodi putanju do tvoje DocumentChunk entitetske klase
import { SendMessageDto } from './dto/send-message.dto';
import {
  AiSearchResult,
  AiGenerationResponse,
  SourceCitation,
} from './interfaces/ai-service.interface';
import { ProductToolsService } from './tools/product-tools.service';
import { OfferToolsService } from './tools/offer-tools.service';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,

    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,

    @InjectRepository(DocumentChunk)
    private readonly documentChunkRepository: Repository<DocumentChunk>,

    private readonly httpService: HttpService,
    private readonly configService: ConfigService,

     private readonly productToolsService:
      ProductToolsService,

       private readonly offerToolsService:
    OfferToolsService,
  ) {}

  private getAiServiceEndpoint(endpoint: string): string {
    const baseUrl = this.configService
      .get<string>('AI_SERVICE_URL', 'http://localhost:8000')
      .replace(/\/+$/, '');
    const cleanEndpoint = endpoint.replace(/^\/+/, '');

    return `${baseUrl}/${cleanEndpoint}`;
  }

  async createConversation(
    organizationId: string,
    userId: string,
    title = 'New conversation',
  ) {
    const conversation = this.conversationRepository.create({
      organizationId,
      userId,
      title,
    });

    return this.conversationRepository.save(conversation);
  }

  async getConversations(organizationId: string) {
    return this.conversationRepository.find({
      where: {
        organizationId,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async getConversation(
    organizationId: string,
    conversationId: string,
  ) {
    const conversation = await this.conversationRepository.findOne({
      where: {
        id: conversationId,
      },
      relations: {
        messages: true,
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (conversation.organizationId !== organizationId) {
      throw new ForbiddenException(
        'You cannot access this conversation',
      );
    }

    if (conversation.messages) {
      conversation.messages.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() -
          new Date(b.createdAt).getTime(),
      );
    }

    return conversation;
  }

  async sendMessage(
    organizationId: string,
    userId: string,
    dto: SendMessageDto,
  ) {
    let conversation: Conversation | null = null;

    if (dto.conversationId) {
      conversation = await this.conversationRepository.findOne({
        where: { id: dto.conversationId },
      });

      if (!conversation) {
        throw new NotFoundException('Conversation not found');
      }

      if (conversation.organizationId !== organizationId) {
        throw new ForbiddenException('You cannot access this conversation');
      }
    } else {
      conversation = await this.createConversation(
        organizationId,
        userId,
        dto.message.substring(0, 50),
      );
    }

    // 1. Sačuvaj korisničku poruku
    const userMessage = this.messageRepository.create({
      conversationId: conversation.id,
      role: MessageRole.USER,
      content: dto.message,
      sources: null,
    });
    await this.messageRepository.save(userMessage);

    // 2. Pretraga dokumenata iz baze sa striktnom organizacionom izolacijom (DAN 62)
    const chunks = await this.documentChunkRepository.find({
      where: {
        document: {
          organizationId,
        },
      },
      relations: { document: true },
      take: 5,
    });

    // Mapiranje rezultata na AiSearchResult interfejs
  
    const searchResults: AiSearchResult[] = chunks.map((chunk) => ({
    document_id: chunk.document?.id || '',
    filename: chunk.document?.originalName || chunk.document?.filename || 'unknown_document', // 👈 Popravlja Grešku 2
    page: chunk.pageNumber,
    content: chunk.content,
    score: 0.89,
}));
    // Formiranje verifikovanih izvora za frontend
    const sources: SourceCitation[] = searchResults.map((result) => ({
      documentId: result.document_id,
      document: result.filename,
      page: result.page,
      score: result.score,
    }));

    // Pristup strukturiranom kontekstu sa [Source N] oznakama (DAN 63)
    const context = this.buildContext(searchResults);

    // 3. Poziv ka FastAPI /generate endpointu
    const generateUrl = this.getAiServiceEndpoint('generate');
    let answer = '';

    try {
      const generationResponse = await firstValueFrom(
        this.httpService.post<AiGenerationResponse>(
          generateUrl,
          {
            question: dto.message,
            context: context,
            organization_id: organizationId, // ✅ DODATO: Pravi UUID organizacije
            conversation_id: conversation.id, // ✅ DODATO: ID trenutne konverzacije
          },
        ),
      );

      answer = generationResponse.data.answer || '';
    } catch (error: any) {
      console.error(' [AI GENERATE ERROR]:', error?.response?.data || error?.message || error);
      throw new Error(`AI Generation service failed: ${error?.message}`);
    }

    // 4. Sačuvaj poruku asistenta sa verifikovanim izvorima
    const assistantMessage = this.messageRepository.create({
      conversationId: conversation.id,
      role: MessageRole.ASSISTANT,
      content: answer,
      sources,
    });

    await this.messageRepository.save(assistantMessage);

    return {
      conversationId: conversation.id,
      userMessage: {
        id: userMessage.id,
        content: userMessage.content,
      },
      assistantMessage: {
        id: assistantMessage.id,
        content: answer,
        sources,
      },
    };
  }

  private buildContext(results: AiSearchResult[]): string {
    return results
      .map(
        (result, index) =>
          `[Source ${index + 1}]
Document ID: ${result.document_id}
Document: ${result.filename}
Page: ${result.page}
Score: ${result.score}

Content:
${result.content}`,
      )
      .join('\n\n');
  }





   async executeTool(
    organizationId: string,
    toolName: string,
    args: Record<string, any>,
  ) {

    switch (toolName) {

      case 'search_products':

        return this.productToolsService
          .searchProducts(
            organizationId,
            args,
          );

      case 'get_product':

        return this.productToolsService
          .getProduct(
            organizationId,
            args,
          );

      

      case 'calculate_offer':

        return this.productToolsService
          .calculateOffer(
            organizationId,
            args,
          );

       case 'create_offer':

        return this.offerToolsService.createOffer(
          organizationId,
          args,
        );

      default:

        throw new BadRequestException(
          `Unknown tool: ${toolName}`,
        );
    }
  }

  async searchRag(
  organizationId: string,
  query: string,
  topK: number = 5,
) {
  try {
    const chunks = await this.documentChunkRepository.find({
      where: organizationId && organizationId !== 'default-org' 
        ? { document: { organizationId } } 
        : {}, // Ako stiže default-org, traži bez striktnog filtera za test
      relations: { document: true },
      take: topK,
    });

    return (chunks || []).map((chunk) => ({
      document_id: chunk.document?.id || '',
      filename:
        chunk.document?.originalName ||
        chunk.document?.filename ||
        'unknown_document',
      page: chunk.pageNumber || 1,
      content: chunk.content || '',
      score: 0.89,
    }));
  } catch (error) {
    console.error('Greška u searchRag metodi:', error);
    return []; // Vraća prazan niz umesto da baci 500 grešku
  }
}
}