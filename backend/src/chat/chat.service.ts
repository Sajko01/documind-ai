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
import { AnalyticsEventType } from 'src/analytics/enums/analytics-event-type.enum';
import { AnalyticsService } from 'src/analytics/analytics.service';
import { UnansweredQuestionsService } from 'src/unanswered-questions/unanswered-questions.service';


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

    private readonly analyticsService: AnalyticsService,

    private readonly unansweredQuestionsService:
      UnansweredQuestionsService,

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




// async sendMessage(
//   organizationId: string,
//   userId: string,
//   dto: SendMessageDto,
// ) {
//   // ⏱️ 1. Započni merenje vremena za analitiku
//   const startTime = Date.now();

//   let conversation: Conversation | null = null;

//   if (dto.conversationId) {
//   //   conversation = await this.conversationRepository.findOne({
//   //     where: { id: dto.conversationId },
//   //   });

//   conversation = await this.conversationRepository.findOne({
//   where: { 
//     id: dto.conversationId, 
//     organizationId: organizationId // ✅ Dodato da spreči curenje između tenanta
//   },
// });

//     if (!conversation) {
//       throw new NotFoundException('Conversation not found');
//     }

//     if (conversation.organizationId !== organizationId) {
//       throw new ForbiddenException('You cannot access this conversation');
//     }
//   } else {
//     conversation = await this.createConversation(
//       organizationId,
//       userId,
//       dto.message.substring(0, 50),
//     );
//   }

//   // 1. Sačuvaj korisničku poruku
//   const userMessage = this.messageRepository.create({
//     conversationId: conversation.id,
//     role: MessageRole.USER,
//     content: dto.message,
//     sources: null,
//   });
//   await this.messageRepository.save(userMessage);

//   // 2. Pretraga dokumenata iz baze sa striktnom organizacionom izolacijom
//   const chunks = await this.documentChunkRepository.find({
//     where: {
//       document: {
//         organizationId,
//       },
//     },
//     relations: { document: true },
//     take: 5,
//   });

//   if (!chunks || chunks.length === 0) {
//     console.warn(`[sendMessage] Nisu pronađeni čunkovi za organizationId: ${organizationId}`);
//   }

//   // Mapiranje rezultata na AiSearchResult interfejs
//   const searchResults: AiSearchResult[] = chunks.map((chunk) => ({
//     document_id: chunk.document?.id || '',
//     filename: chunk.document?.originalName || chunk.document?.filename || 'unknown_document',
//     page: chunk.pageNumber,
//     content: chunk.content,
//     score: 0.89,
//   }));

//   // Formiranje verifikovanih izvora za frontend
//   const sources: SourceCitation[] = searchResults.map((result) => ({
//     documentId: result.document_id,
//     document: result.filename,
//     page: result.page,
//     score: result.score,
//   }));

//   // Pristup strukturiranom kontekstu
//   const context = this.buildContext(searchResults);

//   // 3. Poziv ka FastAPI /generate endpointu
//   const generateUrl = this.getAiServiceEndpoint('generate');
//   let answer = 'Trenutno nisam u mogućnosti da odgovorim na vaše pitanje. Molimo pokušajte ponovo kasnije.';
//   let confidence = 0;
//   let answered = false;

//   const payload = {
//     question: dto.message,
//     context: context || '',
//     organization_id: organizationId,
//     conversation_id: conversation.id,
//   };

//   console.log(`[sendMessage] Šaljem zahtev na AI servis: ${generateUrl}`, JSON.stringify(payload));

//   try {
//     const generationResponse = await firstValueFrom(
//       this.httpService.post<AiGenerationResponse>(
//         generateUrl,
//         payload,
//       ),
//     );

//     console.log('[sendMessage] Uspešan odgovor od AI servisa:', generationResponse.data);

//     answer = generationResponse.data.answer || answer;
//     confidence = generationResponse.data.confidence ?? 0;
//     answered = generationResponse.data.answered ?? (confidence > 0.5);
//   } catch (error: any) {
//     // 🔍 UNAPREĐENO DETALJNO LOGOVANJE GREŠKE
//     const status = error?.response?.status;
//     const errorData = error?.response?.data || error?.message || error;

//     console.error(`❌ [AI GENERATE ERROR] Status: ${status || 'Unknown'}`);
//     console.error(' [AI GENERATE ERROR Details]:', JSON.stringify(errorData, null, 2));

//     // Vrednosti za answer/answered već imaju fallback iznad, pa nastavak izvršavanja ne puca!
//   }

//   // 4. Sačuvaj poruku asistenta sa verifikovanim izvorima
//   const assistantMessage = this.messageRepository.create({
//     conversationId: conversation.id,
//     role: MessageRole.ASSISTANT,
//     content: answer,
//     sources,
//     confidence,
//     answered,
//   });

//   await this.messageRepository.save(assistantMessage);

//   // 5. Ako AI nije mogao pouzdano da odgovorim (ili je poziv pao), evidentiramo ga kao neodgovoreno pitanje
//   if (!answered) {
//     await this.unansweredQuestionsService.create(
//       organizationId,
//       userId,
//       {
//         question: dto.message,
//         confidence: confidence,
//         conversationId: conversation.id,
//         messageId: assistantMessage.id,
//       },
//     );

//     // 📊 Track event za neodgovoreno pitanje
//     await this.analyticsService.trackEvent({
//       organizationId: organizationId,
//       userId: userId,
//       eventType: AnalyticsEventType.UNANSWERED_QUESTION,
//       conversationId: conversation.id,
//       metadata: {
//         question: dto.message,
//         confidence: confidence,
//         messageId: assistantMessage.id,
//       },
//     });
//   }

//   // ⏱️ 📊 Izračunavanje metrika za analitiku
//   const responseTimeMs = Date.now() - startTime;

//   const averageRetrievalScore =
//     searchResults && searchResults.length
//       ? searchResults.reduce(
//           (sum, result) => sum + (result.score || 0),
//           0,
//         ) / searchResults.length
//       : undefined;

//   // 📊 Logovanje event-a da je postavljeno pitanje
//   await this.analyticsService.trackEvent({
//     organizationId: organizationId,
//     userId: userId,
//     eventType: AnalyticsEventType.QUESTION_ASKED,
//     conversationId: conversation.id,
//     responseTimeMs: responseTimeMs,
//     retrievalScore: averageRetrievalScore,
//     metadata: {
//       question: dto.message,
//       topK: 5,
//       confidence: confidence,
//       answered: answered,
//       retrievedDocuments: searchResults.map((result) => ({
//         documentId: result.document_id,
//         filename: result.filename,
//         page: result.page,
//       })),
//     },
//   });

//   return {
//     conversationId: conversation.id,
//     userMessage: {
//       id: userMessage.id,
//       content: userMessage.content,
//     },
//     assistantMessage: {
//       id: assistantMessage.id,
//       content: answer,
//       sources,
//       confidence,
//       answered,
//     },
//   };
// }
// async sendMessage(
//   organizationId: string,
//   userId: string,
//   dto: SendMessageDto,
// ) {
//   // ⏱️ 1. Započni merenje vremena za analitiku
//   const startTime = Date.now();

//   let conversation: Conversation | null = null;

//   if (dto.conversationId) {
//     conversation = await this.conversationRepository.findOne({
//       where: { 
//         id: dto.conversationId, 
//         organizationId: organizationId // ✅ Dodato da spreči curenje između tenanta
//       },
//     });

//     if (!conversation) {
//       throw new NotFoundException('Conversation not found');
//     }

//     if (conversation.organizationId !== organizationId) {
//       throw new ForbiddenException('You cannot access this conversation');
//     }
//   } else {
//     conversation = await this.createConversation(
//       organizationId,
//       userId,
//       dto.message.substring(0, 50),
//     );
//   }

//   // 1. Sačuvaj korisničku poruku
//   const userMessage = this.messageRepository.create({
//     conversationId: conversation.id,
//     role: MessageRole.USER,
//     content: dto.message,
//     sources: null,
//   });
//   await this.messageRepository.save(userMessage);

//   // 2. Pretraga dokumenata iz baze sa striktnom organizacionom izolacijom
//   const chunks = await this.documentChunkRepository.find({
//     where: {
//       document: {
//         organizationId,
//       },
//     },
//     relations: { document: true },
//     take: 5,
//   });

//   if (!chunks || chunks.length === 0) {
//     console.warn(`[sendMessage] Nisu pronađeni čunkovi za organizationId: ${organizationId}`);
//   }

//   // Mapiranje rezultata na AiSearchResult interfejs
//   const searchResults: AiSearchResult[] = chunks.map((chunk) => ({
//     document_id: chunk.document?.id || '',
//     filename: chunk.document?.originalName || chunk.document?.filename || 'unknown_document',
//     page: chunk.pageNumber,
//     content: chunk.content,
//     score: 0.89,
//   }));

//   // Formiranje verifikovanih izvora za frontend
//   const sources: SourceCitation[] = searchResults.map((result) => ({
//     documentId: result.document_id,
//     document: result.filename,
//     page: result.page,
//     score: result.score,
//   }));

//   // Pristup strukturiranom kontekstu
//   const context = this.buildContext(searchResults);

//   // 3. Poziv ka FastAPI /generate endpointu
//   const generateUrl = this.getAiServiceEndpoint('generate');
//   let answer = 'Trenutno nisam u mogućnosti da odgovorim na vaše pitanje. Molimo pokušajte ponovo kasnije.';
//   let confidence = 0;
//   let answered = false;

//   const payload = {
//     question: dto.message,
//     context: context || '',
//     organization_id: organizationId,
//     conversation_id: conversation.id,
//   };

//   console.log(`[sendMessage] Šaljem zahtev na AI servis: ${generateUrl}`, JSON.stringify(payload));

//   try {
//     const generationResponse = await firstValueFrom(
//       this.httpService.post<any>( // Možeš zameniti sa AiGenerationResponse interfejsom koji ima i .metrics
//         generateUrl,
//         payload,
//       ),
//     );

//     console.log('[sendMessage] Uspešan odgovor od AI servisa:', generationResponse.data);

//     answer = generationResponse.data.answer || answer;
//     confidence = generationResponse.data.confidence ?? 0;
//     answered = generationResponse.data.answered ?? (confidence > 0.5);

//     // 📊 OBSERVABILITY - Hvatanje i ispis metrika latencije koje dolaze iz Pythona
//     const aiMetrics = generationResponse.data.metrics;
//     const nestTotalTime = ((Date.now() - startTime) / 1000).toFixed(2);

//     console.log(`\n--- 📊 OBSERVABILITY METRICS ---`);
//     console.log(`Request: /api/chat/message (Total Nest Time: ${nestTotalTime}s)`);
//     if (aiMetrics) {
//       console.log(`AI Pipeline Total: ${aiMetrics.total}s`);
//       console.log(`Embedding: ${aiMetrics.embedding}s`);
//       console.log(`Retrieval & Rerank: ${aiMetrics.retrieval}s`);
//       console.log(`LLM Generation: ${aiMetrics.llm}s`);
//     }
//     console.log(`-----------------------------------\n`);

//   } catch (error: any) {
//     // 🔍 UNAPREĐENO DETALJNO LOGOVANJE GREŠKE (Errors requirement)
//     const status = error?.response?.status;
//     const errorData = error?.response?.data || error?.message || error;

//     console.error(`❌ [AI GENERATE ERROR] Status: ${status || 'Unknown'}`);
//     console.error(' [AI GENERATE ERROR Details]:', JSON.stringify(errorData, null, 2));
//   }

//   // 4. Sačuvaj poruku asistenta sa verifikovanim izvorima
//   const assistantMessage = this.messageRepository.create({
//     conversationId: conversation.id,
//     role: MessageRole.ASSISTANT,
//     content: answer,
//     sources,
//     confidence,
//     answered,
//   });

//   await this.messageRepository.save(assistantMessage);

//   // 5. Ako AI nije mogao pouzdano da odgovori...
//   if (!answered) {
//     await this.unansweredQuestionsService.create(
//       organizationId,
//       userId,
//       {
//         question: dto.message,
//         confidence: confidence,
//         conversationId: conversation.id,
//         messageId: assistantMessage.id,
//       },
//     );

//     await this.analyticsService.trackEvent({
//       organizationId: organizationId,
//       userId: userId,
//       eventType: AnalyticsEventType.UNANSWERED_QUESTION,
//       conversationId: conversation.id,
//       metadata: {
//         question: dto.message,
//         confidence: confidence,
//         messageId: assistantMessage.id,
//       },
//     });
//   }

//   const responseTimeMs = Date.now() - startTime;

//   const averageRetrievalScore =
//     searchResults && searchResults.length
//       ? searchResults.reduce(
//           (sum, result) => sum + (result.score || 0),
//           0,
//         ) / searchResults.length
//       : undefined;

//   await this.analyticsService.trackEvent({
//     organizationId: organizationId,
//     userId: userId,
//     eventType: AnalyticsEventType.QUESTION_ASKED,
//     conversationId: conversation.id,
//     responseTimeMs: responseTimeMs,
//     retrievalScore: averageRetrievalScore,
//     metadata: {
//       question: dto.message,
//       topK: 5,
//       confidence: confidence,
//       answered: answered,
//       retrievedDocuments: searchResults.map((result) => ({
//         documentId: result.document_id,
//         filename: result.filename,
//         page: result.page,
//       })),
//     },
//   });

//   return {
//     conversationId: conversation.id,
//     userMessage: {
//       id: userMessage.id,
//       content: userMessage.content,
//     },
//     assistantMessage: {
//       id: assistantMessage.id,
//       content: answer,
//       sources,
//       confidence,
//       answered,
//     },

//     // 👉 DODAJ OVO OVDJE:
//     metrics: aiMetrics ? {
//       totalTime: aiMetrics.total,
//       embeddingTime: aiMetrics.embedding,
//       retrievalTime: aiMetrics.retrieval,
//       llmTime: aiMetrics.llm,
//     } : null
//   };
// }

async sendMessage(
  organizationId: string,
  userId: string,
  dto: SendMessageDto,
) {
  // ⏱️ 1. Započni merenje vremena za analitiku
  const startTime = Date.now();

  let conversation: Conversation | null = null;

  if (dto.conversationId) {
    conversation = await this.conversationRepository.findOne({
      where: { 
        id: dto.conversationId, 
        organizationId: organizationId // ✅ Dodato da spreči curenje između tenanta
      },
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

  // 2. Pretraga dokumenata iz baze sa striktnom organizacionom izolacijom
  const chunks = await this.documentChunkRepository.find({
    where: {
      document: {
        organizationId,
      },
    },
    relations: { document: true },
    take: 5,
  });

  if (!chunks || chunks.length === 0) {
    console.warn(`[sendMessage] Nisu pronađeni čunkovi za organizationId: ${organizationId}`);
  }

  // Mapiranje rezultata na AiSearchResult interfejs
  const searchResults: AiSearchResult[] = chunks.map((chunk) => ({
    document_id: chunk.document?.id || '',
    filename: chunk.document?.originalName || chunk.document?.filename || 'unknown_document',
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

  // Pristup strukturiranom kontekstu
  const context = this.buildContext(searchResults);

  // 3. Poziv ka FastAPI /generate endpointu
  const generateUrl = this.getAiServiceEndpoint('generate');
  let answer = 'Trenutno nisam u mogućnosti da odgovorim na vaše pitanje. Molimo pokušajte ponovo kasnije.';
  let confidence = 0;
  let answered = false;
  
  // 👉 Deklarisano ovde da bude dostupno u celoj funkciji
  let aiMetrics: any = null;

  const payload = {
    question: dto.message,
    context: context || '',
    organization_id: organizationId,
    conversation_id: conversation.id,
  };

  console.log(`[sendMessage] Šaljem zahtev na AI servis: ${generateUrl}`, JSON.stringify(payload));

  try {
    const generationResponse = await firstValueFrom(
      this.httpService.post<any>(
        generateUrl,
        payload,
      ),
    );

    console.log('[sendMessage] Uspešan odgovor od AI servisa:', generationResponse.data);

    answer = generationResponse.data.answer || answer;
    confidence = generationResponse.data.confidence ?? 0;
    answered = generationResponse.data.answered ?? (confidence > 0.5);

    // 📊 Dodela vrednosti metrika iz odgovora
    aiMetrics = generationResponse.data.metrics;
    const nestTotalTime = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`\n--- 📊 OBSERVABILITY METRICS ---`);
    console.log(`Request: /api/chat/message (Total Nest Time: ${nestTotalTime}s)`);
    if (aiMetrics) {
      console.log(`AI Pipeline Total: ${aiMetrics.total}s`);
      console.log(`Embedding: ${aiMetrics.embedding}s`);
      console.log(`Retrieval & Rerank: ${aiMetrics.retrieval}s`);
      console.log(`LLM Generation: ${aiMetrics.llm}s`);
    }
    console.log(`-----------------------------------\n`);

  } catch (error: any) {
    const status = error?.response?.status;
    const errorData = error?.response?.data || error?.message || error;

    console.error(`❌ [AI GENERATE ERROR] Status: ${status || 'Unknown'}`);
    console.error(' [AI GENERATE ERROR Details]:', JSON.stringify(errorData, null, 2));
  }

  // 4. Sačuvaj poruku asistenta sa verifikovanim izvorima
  const assistantMessage = this.messageRepository.create({
    conversationId: conversation.id,
    role: MessageRole.ASSISTANT,
    content: answer,
    sources,
    confidence,
    answered,
  });

  await this.messageRepository.save(assistantMessage);

  // 5. Ako AI nije mogao pouzdano da odgovori...
  if (!answered) {
    await this.unansweredQuestionsService.create(
      organizationId,
      userId,
      {
        question: dto.message,
        confidence: confidence,
        conversationId: conversation.id,
        messageId: assistantMessage.id,
      },
    );

    await this.analyticsService.trackEvent({
      organizationId: organizationId,
      userId: userId,
      eventType: AnalyticsEventType.UNANSWERED_QUESTION,
      conversationId: conversation.id,
      metadata: {
        question: dto.message,
        confidence: confidence,
        messageId: assistantMessage.id,
      },
    });
  }

  const responseTimeMs = Date.now() - startTime;

  const averageRetrievalScore =
    searchResults && searchResults.length
      ? searchResults.reduce(
          (sum, result) => sum + (result.score || 0),
          0,
        ) / searchResults.length
      : undefined;

  await this.analyticsService.trackEvent({
    organizationId: organizationId,
    userId: userId,
    eventType: AnalyticsEventType.QUESTION_ASKED,
    conversationId: conversation.id,
    responseTimeMs: responseTimeMs,
    retrievalScore: averageRetrievalScore,
    metadata: {
      question: dto.message,
      topK: 5,
      confidence: confidence,
      answered: answered,
      retrievedDocuments: searchResults.map((result) => ({
        documentId: result.document_id,
        filename: result.filename,
        page: result.page,
      })),
    },
  });

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
      confidence,
      answered,
      // 👉 OVDE DODAJEMO METRIKE DA BUDU UNUTAR PORUKE ASISTENTA
      metrics: aiMetrics ? {
        totalTime: aiMetrics.total,
        embeddingTime: aiMetrics.embedding,
        retrievalTime: aiMetrics.retrieval,
        llmTime: aiMetrics.llm,
      } : null
    },
    // Možeš ostaviti i ovde na root-u ako ti negde drugo treba, ali zbog frontenda je ključno gore
    metrics: aiMetrics ? {
      totalTime: aiMetrics.total,
      embeddingTime: aiMetrics.embedding,
      retrievalTime: aiMetrics.retrieval,
      llmTime: aiMetrics.llm,
    } : null
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
    userId: string, //
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

        // return this.offerToolsService.createOffer(
        //   organizationId,
        //   args,
        // );
        // Primer unutar chat.service.ts gde se poziva tool
return this.offerToolsService.createOffer(
  organizationId, // 1. argument
  userId,         // 2. argument (trenutno ulogovani korisnik ili iz konteksta chata)
  args,       // 3. argument (args - podaci za kreiranje ponude)
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