

// import {
//   BadRequestException,
//   ForbiddenException,
//   Injectable,
//   Logger,
//   NotFoundException,
// } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { HttpService } from '@nestjs/axios';
// import { ConfigService } from '@nestjs/config';
// import { firstValueFrom } from 'rxjs';
// import {
//   existsSync,
//   mkdirSync,
//   unlinkSync,
//   renameSync,
//   readFileSync,
// } from 'fs';
// import { join, basename } from 'path';
// import { randomUUID } from 'crypto';
// import FormData from 'form-data';

// import { Document, DocumentStatus } from './entities/document.entity';
// import { DocumentChunk } from './entities/document-chunk.entity';
// import { CreateDocumentDto } from './dto/create-document.dto';
// import { AiProcessingResponse } from './interfaces/ai-processing-response.interface';

// @Injectable()
// export class DocumentsService {
//   private readonly logger = new Logger(DocumentsService.name);

//   private readonly tempDirectory = join(process.cwd(), 'uploads', 'tmp');
//   private readonly documentsDirectory = join(
//     process.cwd(),
//     'uploads',
//     'documents',
//   );
//   private readonly aiServiceUrl: string;

//   constructor(
//     @InjectRepository(Document)
//     private readonly documentsRepository: Repository<Document>,
//     @InjectRepository(DocumentChunk)
//     private readonly chunksRepository: Repository<DocumentChunk>,
//     private readonly httpService: HttpService,
//     private readonly configService: ConfigService,
//   ) {
//     this.aiServiceUrl = this.configService.get<string>(
//       'AI_SERVICE_URL',
//       'http://localhost:8000',
//     );

//     this.ensureDirectories();
//   }

//   // Osigurava postojanje direktorijuma za privremeno i trajno skladištenje
//   private ensureDirectories(): void {
//     if (!existsSync(this.tempDirectory)) {
//       mkdirSync(this.tempDirectory, { recursive: true });
//     }

//     if (!existsSync(this.documentsDirectory)) {
//       mkdirSync(this.documentsDirectory, { recursive: true });
//     }
//   }

//   // 1. Kreiranje tekstualnog/osnovnog dokumenta
//   async create(
//     dto: CreateDocumentDto,
//     organizationId: string,
//     createdById: string,
//   ): Promise<Document> {
//     const document = this.documentsRepository.create({
//       ...dto,
//       organizationId,
//       createdById,
//     });

//     return this.documentsRepository.save(document);
//   }

//   // 2. Upload PDF fajla na disk (sa Magic Bytes proverom) + Pokretanje AI obrade
//   async upload(
//     file: Express.Multer.File,
//     organizationId: string,
//     createdById: string,
//   ): Promise<Document> {
//     if (!file || !file.path) {
//       throw new BadRequestException('PDF file is required');
//     }

//     const originalName = basename(file.originalname);

//     if (
//       !originalName.toLowerCase().endsWith('.pdf') ||
//       file.mimetype !== 'application/pdf'
//     ) {
//       this.deleteFileIfExists(file.path);
//       throw new BadRequestException('Only PDF files are allowed');
//     }

//     // 🔒 Validacija PDF Magic Bytes (%PDF-)
//     try {
//       this.validatePdfSignature(file.path);
//     } catch (error) {
//       this.deleteFileIfExists(file.path);
//       throw error;
//     }

//     const documentId = randomUUID();
//     const filename = `${documentId}.pdf`;

//     const organizationDirectory = join(
//       this.documentsDirectory,
//       organizationId,
//     );

//     if (!existsSync(organizationDirectory)) {
//       mkdirSync(organizationDirectory, { recursive: true });
//     }

//     const finalPath = join(organizationDirectory, filename);
//     const storagePath = `uploads/documents/${organizationId}/${filename}`;

//     renameSync(file.path, finalPath);

//     try {
//       let document = this.documentsRepository.create({
//         id: documentId,
//         organizationId,
//         createdById,
//         filename,
//         originalName,
//         mimeType: file.mimetype,
//         size: file.size.toString(),
//         storagePath,
//         extractedText: null,
//         pageCount: null,
//         status: DocumentStatus.UPLOADED,
//       });

//       document = await this.documentsRepository.save(document);

//       // Poziv AI servisa za ekstrakciju teksta i chunking
//       document = await this.processDocument(document);

//       return document;
//     } catch (error) {
//       this.deleteFileIfExists(finalPath);
//       throw error;
//     }
//   }

//   async processDocument(document: Document): Promise<Document> {
//     this.logger.log(`Starting processing for document ${document.id}`);

//     if (!document.storagePath) {
//       throw new BadRequestException('Document storage path is missing');
//     }

//     document.status = DocumentStatus.PROCESSING;
//     await this.documentsRepository.save(document);

//     const physicalPath = join(process.cwd(), document.storagePath);

//     try {
//       const fileBuffer = readFileSync(physicalPath);
//       const formData = new FormData();

//       formData.append('document_id', document.id);

//       const filename =
//         document.originalName || document.filename || 'document.pdf';

//       formData.append('file', fileBuffer, {
//         filename: filename,
//         contentType: 'application/pdf',
//       });

//       const response = await firstValueFrom(
//         this.httpService.post<AiProcessingResponse>(
//           `${this.aiServiceUrl}/process-document`,
//           formData,
//           {
//             headers: formData.getHeaders(),
//             maxBodyLength: 20 * 1024 * 1024,
//             maxContentLength: 20 * 1024 * 1024,
//             timeout: 120000,
//           },
//         ),
//       );

//       const result = response.data;

//       document.extractedText = result.text;
//       document.pageCount = result.page_count;

//       // 🔄 Čuvanje chunk-ova u bazu sa pageNumber i tokenCount
//       if (result.chunks && result.chunks.length > 0) {
//         const chunkEntities = result.chunks.map((chunk) =>
//           this.chunksRepository.create({
//             documentId: document.id,
//             pageNumber: chunk.page_number,
//             chunkIndex: chunk.chunk_index,
//             content: chunk.content,
//             tokenCount: chunk.token_count,
//           }),
//         );

//         await this.chunksRepository.save(chunkEntities);
//         this.logger.log(
//           `Saved ${chunkEntities.length} chunks for document ${document.id}`,
//         );
//       }

//       document.status = DocumentStatus.READY;

//       const savedDocument = await this.documentsRepository.save(document);
//       this.logger.log(`Document ${document.id} processed successfully`);

//       return savedDocument;
//     } catch (error) {
//       this.logger.error(
//         `Document ${document.id} processing failed`,
//         error instanceof Error ? error.stack : String(error),
//       );

//       document.status = DocumentStatus.FAILED;
//       await this.documentsRepository.save(document);

//       return document;
//     }
//   }

//   // 4. Pretraga svih dokumenata za organizaciju
//   async findAll(organizationId: string): Promise<Document[]> {
//     return this.documentsRepository.find({
//       where: { organizationId },
//       order: { createdAt: 'DESC' },
//     });
//   }

//   // 5. Brisanje dokumenta (provera prava + čišćenje sa diska)
//   async delete(
//     documentId: string,
//     userOrganizationId: string,
//   ): Promise<{ success: boolean; message: string }> {
//     const document = await this.documentsRepository.findOne({
//       where: { id: documentId },
//     });

//     if (!document) {
//       throw new NotFoundException({
//         success: false,
//         error: {
//           code: 'DOCUMENT_NOT_FOUND',
//           message: 'Document does not exist',
//         },
//       });
//     }

//     // 🔒 Security Guard: Ako dokument pripada drugoj organizaciji
//     if (document.organizationId !== userOrganizationId) {
//       throw new ForbiddenException({
//         success: false,
//         error: {
//           code: 'FORBIDDEN_RESOURCE',
//           message: 'You do not have access to this document',
//         },
//       });
//     }

//     // Fizičko brisanje fajla sa diska ako postoji
//     if (document.storagePath) {
//       const physicalPath = join(process.cwd(), document.storagePath);
//       this.deleteFileIfExists(physicalPath);
//     }

//     await this.documentsRepository.remove(document);

//     return {
//       success: true,
//       message: 'Document successfully deleted',
//     };
//   }

//   // Helper metoda za brisanje sa diska
//   private deleteFileIfExists(filePath: string): void {
//     if (existsSync(filePath)) {
//       unlinkSync(filePath);
//     }
//   }

//   // Helper metoda za Magic Bytes proveru (%PDF-)
//   private validatePdfSignature(filePath: string): void {
//     const buffer = readFileSync(filePath);
//     const header = buffer.subarray(0, 5).toString('ascii');

//     if (header !== '%PDF-') {
//       throw new BadRequestException('Invalid PDF file signature');
//     }
//   }

//   // Pretraga svih chunk-ova za određeni dokument (uz proveru organizacije)
//   async findChunks(
//     documentId: string,
//     organizationId: string,
//   ): Promise<DocumentChunk[]> {
//     // 1. Prvo proveravamo da li dokument postoji i da li pripada organizaciji korisnika
//     const document = await this.documentsRepository.findOne({
//       where: { id: documentId },
//     });

//     if (!document) {
//       throw new NotFoundException({
//         success: false,
//         error: {
//           code: 'DOCUMENT_NOT_FOUND',
//           message: 'Document does not exist',
//         },
//       });
//     }

//     // 🔒 Security Guard: Sprečava pristup dokumentima iz drugih organizacija
//     if (document.organizationId !== organizationId) {
//       throw new ForbiddenException({
//         success: false,
//         error: {
//           code: 'FORBIDDEN_RESOURCE',
//           message: 'You do not have access to this document',
//         },
//       });
//     }

//     // 2. Vraćamo sve chunk-ove sortirane po stranici i po redosledu unutar stranice
//     return this.chunksRepository.find({
//       where: { documentId },
//       order: {
//         pageNumber: 'ASC',
//         chunkIndex: 'ASC',
//       },
//     });
//   }
// }

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import {
  existsSync,
  mkdirSync,
  unlinkSync,
  renameSync,
  readFileSync,
} from 'fs';
import { join, basename } from 'path';
import { randomUUID } from 'crypto';
import FormData from 'form-data';

import { Document, DocumentStatus } from './entities/document.entity';
import { DocumentChunk } from './entities/document-chunk.entity';
import { CreateDocumentDto } from './dto/create-document.dto';
import { AiProcessingResponse } from './interfaces/ai-processing-response.interface';
import { AiEmbeddingResponse } from './interfaces/ai-embedding.interface';
import { DocumentSearchResponse, DocumentSearchResult } from './interfaces/document-search.interface';
import { AiGenerationResponse } from './interfaces/ai-generation.interface';

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  private readonly tempDirectory = join(process.cwd(), 'uploads', 'tmp');
  private readonly documentsDirectory = join(
    process.cwd(),
    'uploads',
    'documents',
  );
  private readonly aiServiceUrl: string;

  constructor(
    @InjectRepository(Document)
    private readonly documentsRepository: Repository<Document>,
    @InjectRepository(DocumentChunk)
    private readonly chunksRepository: Repository<DocumentChunk>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.aiServiceUrl = this.configService.get<string>(
      'AI_SERVICE_URL',
      'http://localhost:8000',
    );

    this.ensureDirectories();
  }

  // Osigurava postojanje direktorijuma za privremeno i trajno skladištenje
  private ensureDirectories(): void {
    if (!existsSync(this.tempDirectory)) {
      mkdirSync(this.tempDirectory, { recursive: true });
    }

    if (!existsSync(this.documentsDirectory)) {
      mkdirSync(this.documentsDirectory, { recursive: true });
    }
  }

  // 1. Kreiranje tekstualnog/osnovnog dokumenta
  async create(
    dto: CreateDocumentDto,
    organizationId: string,
    createdById: string,
  ): Promise<Document> {
    const document = this.documentsRepository.create({
      ...dto,
      organizationId,
      createdById,
    });

    return this.documentsRepository.save(document);
  }

  // 2. Upload PDF fajla na disk (sa Magic Bytes proverom) + Pokretanje AI obrade
  async upload(
    file: Express.Multer.File,
    organizationId: string,
    createdById: string,
  ): Promise<Document> {
    if (!file || !file.path) {
      throw new BadRequestException('PDF file is required');
    }

    const originalName = basename(file.originalname);

    if (
      !originalName.toLowerCase().endsWith('.pdf') ||
      file.mimetype !== 'application/pdf'
    ) {
      this.deleteFileIfExists(file.path);
      throw new BadRequestException('Only PDF files are allowed');
    }

    // 🔒 Validacija PDF Magic Bytes (%PDF-)
    try {
      this.validatePdfSignature(file.path);
    } catch (error) {
      this.deleteFileIfExists(file.path);
      throw error;
    }

    const documentId = randomUUID();
    const filename = `${documentId}.pdf`;

    const organizationDirectory = join(
      this.documentsDirectory,
      organizationId,
    );

    if (!existsSync(organizationDirectory)) {
      mkdirSync(organizationDirectory, { recursive: true });
    }

    const finalPath = join(organizationDirectory, filename);
    const storagePath = `uploads/documents/${organizationId}/${filename}`;

    renameSync(file.path, finalPath);

    try {
      let document = this.documentsRepository.create({
        id: documentId,
        organizationId,
        createdById,
        filename,
        originalName,
        mimeType: file.mimetype,
        size: file.size.toString(),
        storagePath,
        extractedText: null,
        pageCount: null,
        status: DocumentStatus.UPLOADED,
      });

      document = await this.documentsRepository.save(document);

      // Poziv AI servisa za ekstrakciju teksta i chunking
      document = await this.processDocument(document);

      return document;
    } catch (error) {
      this.deleteFileIfExists(finalPath);
      throw error;
    }
  }

  async processDocument(document: Document): Promise<Document> {
    this.logger.log(`Starting processing for document ${document.id}`);

    if (!document.storagePath) {
      throw new BadRequestException('Document storage path is missing');
    }

    document.status = DocumentStatus.PROCESSING;
    await this.documentsRepository.save(document);

    const physicalPath = join(process.cwd(), document.storagePath);

    try {
      const fileBuffer = readFileSync(physicalPath);
      const formData = new FormData();

      formData.append('document_id', document.id);

      const filename =
        document.originalName || document.filename || 'document.pdf';

      formData.append('file', fileBuffer, {
        filename: filename,
        contentType: 'application/pdf',
      });

      const response = await firstValueFrom(
        this.httpService.post<AiProcessingResponse>(
          `${this.aiServiceUrl}/process-document`,
          formData,
          {
            headers: formData.getHeaders(),
            maxBodyLength: 20 * 1024 * 1024,
            maxContentLength: 20 * 1024 * 1024,
            timeout: 120000,
          },
        ),
      );

     const result = response.data;

      document.extractedText = result.text;
      document.pageCount = result.page_count;

      // 1. Obriši stare chunk-ove za ovaj dokument ako postoje (idempotentnost)
      await this.chunksRepository.delete({
        documentId: document.id,
      });

      // 2. Mapiraj i sačuvaj nove chunk-ove sa embedding i metadata poljima
      if (result.chunks && result.chunks.length > 0) {
        const chunkEntities = result.chunks.map((chunk) =>
          this.chunksRepository.create({
            documentId: document.id,
            pageNumber: chunk.page_number,
            chunkIndex: chunk.chunk_index,
            content: chunk.content,
            tokenCount: chunk.token_count,
            embedding: chunk.embedding,
            metadata: {
              source: 'pdf',
              page_number: chunk.page_number,
              chunk_index: chunk.chunk_index,
            },
          }),
        );

        await this.chunksRepository.save(chunkEntities);
        this.logger.log(
          `Saved ${chunkEntities.length} chunks for document ${document.id}`,
        );
      }

      document.status = DocumentStatus.READY;

      const savedDocument = await this.documentsRepository.save(document);
      this.logger.log(`Document ${document.id} processed successfully`);

      return savedDocument;
    } catch (error) {
      this.logger.error(
        `Document ${document.id} processing failed`,
        error instanceof Error ? error.stack : String(error),
      );

      document.status = DocumentStatus.FAILED;
      await this.documentsRepository.save(document);

      return document;
    }
  }

  // 4. Pretraga svih dokumenata za organizaciju
  async findAll(organizationId: string): Promise<Document[]> {
    return this.documentsRepository.find({
      where: { organizationId },
      order: { createdAt: 'DESC' },
    });
  }

  // 5. Brisanje dokumenta (provera prava + čišćenje sa diska)
  async delete(
    documentId: string,
    userOrganizationId: string,
  ): Promise<{ success: boolean; message: string }> {
    const document = await this.documentsRepository.findOne({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException({
        success: false,
        error: {
          code: 'DOCUMENT_NOT_FOUND',
          message: 'Document does not exist',
        },
      });
    }

    // 🔒 Security Guard: Ako dokument pripada drugoj organizaciji
    if (document.organizationId !== userOrganizationId) {
      throw new ForbiddenException({
        success: false,
        error: {
          code: 'FORBIDDEN_RESOURCE',
          message: 'You do not have access to this document',
        },
      });
    }

    // Fizičko brisanje fajla sa diska ako postoji
    if (document.storagePath) {
      const physicalPath = join(process.cwd(), document.storagePath);
      this.deleteFileIfExists(physicalPath);
    }

    await this.documentsRepository.remove(document);

    return {
      success: true,
      message: 'Document successfully deleted',
    };
  }

  // Helper metoda za brisanje sa diska
  private deleteFileIfExists(filePath: string): void {
    if (existsSync(filePath)) {
      unlinkSync(filePath);
    }
  }

  // Helper metoda za Magic Bytes proveru (%PDF-)
  private validatePdfSignature(filePath: string): void {
    const buffer = readFileSync(filePath);
    const header = buffer.subarray(0, 5).toString('ascii');

    if (header !== '%PDF-') {
      throw new BadRequestException('Invalid PDF file signature');
    }
  }

  // Pretraga svih chunk-ova za određeni dokument (uz proveru organizacije)
  async findChunks(
    documentId: string,
    organizationId: string,
  ): Promise<DocumentChunk[]> {
    // 1. Prvo proveravamo da li dokument postoji i da li pripada organizaciji korisnika
    const document = await this.documentsRepository.findOne({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException({
        success: false,
        error: {
          code: 'DOCUMENT_NOT_FOUND',
          message: 'Document does not exist',
        },
      });
    }

    // 🔒 Security Guard: Sprečava pristup dokumentima iz drugih organizacija
    if (document.organizationId !== organizationId) {
      throw new ForbiddenException({
        success: false,
        error: {
          code: 'FORBIDDEN_RESOURCE',
          message: 'You do not have access to this document',
        },
      });
    }

    // 2. Vraćamo sve chunk-ove sortirane po stranici i po redosledu unutar stranice
    return this.chunksRepository.find({
      where: { documentId },
      order: {
        pageNumber: 'ASC',
        chunkIndex: 'ASC',
      },
    });
  }

  // // 6. Semantička (Vektorska) pretraga dokumenata
  // async search(
  //   organizationId: string,
  //   query: string,
  //   topK: number = 5,
  // ): Promise<{
  //   query: string;
  //   results: Array<{
  //     chunkId: string;
  //     documentId: string;
  //     documentTitle: string | null;
  //     documentOriginalName: string | null;
  //     content: string;
  //     pageNumber: number;
  //     similarity: number;
  //   }>;
  // }> {
  //   if (!query || query.trim().length === 0) {
  //     throw new BadRequestException('Search query cannot be empty');
  //   }

  //   try {
  //     // 1. Pozivamo Python AI servis da generiše embedding za uneti upit (query)
  //     const response = await firstValueFrom(
  //       this.httpService.post<{
  //         success: boolean;
  //         embedding: number[];
  //       }>(`${this.aiServiceUrl}/embed`, {
  //         text: query,
  //       }),
  //     );

  //     const queryEmbedding = response.data.embedding;

  //     if (!queryEmbedding || queryEmbedding.length === 0) {
  //       throw new BadRequestException('Failed to generate query embedding');
  //     }

  //     // Formatiramo vector niz za PGVector upit ([0.1, 0.2, ...])
  //     const vectorString = `[${queryEmbedding.join(',')}]`;

  //     // 2. Izvršavamo PGVector upit koristeći kosinusnu sličnost <=> (1 - cosine_distance = cosine_similarity)
  //     // Takođe filtriramo po organization_id radi bezbednosti (multitenancy)
  //     const rawResults = await this.chunksRepository.query(
  //       `
  //       SELECT 
  //         c.id AS "chunkId",
  //         c.document_id AS "documentId",
  //         c.content AS "content",
  //         c.page_number AS "pageNumber",
  //         c.chunk_index AS "chunkIndex",
  //         d.title AS "documentTitle",
  //         d.original_name AS "documentOriginalName",
  //         1 - (c.embedding <=> $1::vector) AS similarity
  //       FROM document_chunks c
  //       INNER JOIN documents d ON c.document_id = d.id
  //       WHERE d.organization_id = $2
  //         AND c.embedding IS NOT NULL
  //       ORDER BY c.embedding <=> $1::vector ASC
  //       LIMIT $3
  //       `,
  //       [vectorString, organizationId, topK],
  //     );

  //     // 3. Vraćamo formatirane rezultate sa procentom sličnosti
  //     const results = rawResults.map((row: any) => ({
  //       chunkId: row.chunkId,
  //       documentId: row.documentId,
  //       documentTitle: row.documentTitle,
  //       documentOriginalName: row.documentOriginalName,
  //       content: row.content,
  //       pageNumber: row.pageNumber,
  //       similarity: parseFloat(parseFloat(row.similarity).toFixed(4)),
  //     }));

  //     return {
  //       query,
  //       results,
  //     };
  //   } catch (error) {
  //     this.logger.error(
  //       `Failed to perform vector search for query: "${query}"`,
  //       error instanceof Error ? error.stack : String(error),
  //     );

  //     throw new BadRequestException(
  //       'Search failed. Make sure AI service is available and embeddings are populated.',
  //     );
  //   }
  // }

// Pomoćna metoda za kreiranje embedding-a
  private async generateQueryEmbedding(query: string): Promise<number[]> {
    const response = await firstValueFrom(
      this.httpService.post<{
        success: boolean;
        embedding: number[];
      }>(`${this.aiServiceUrl}/embed`, {
        text: query,
      }),
    );

    if (!response.data?.embedding) {
      throw new BadRequestException('Failed to generate query embedding from AI service');
    }

    return response.data.embedding;
  }

  // Pomoćna metoda za konverziju u SQL vector format
  private vectorToSql(embedding: number[]): string {
    return `[${embedding.join(',')}]`;
  }

  // Glavna search metoda
 async search(
  organizationId: string,
  query: string,
  topK = 5,
  threshold = 0.50,
): Promise<DocumentSearchResponse> {
  if (!query || query.trim().length === 0) {
    throw new BadRequestException('Search query cannot be empty');
  }

  const embedding = await this.generateQueryEmbedding(query);
  const vector = this.vectorToSql(embedding);

  const rows = await this.chunksRepository.query(
    `
    SELECT
      document_chunks.content,
      document_chunks.page_number,
      document_chunks.chunk_index,
      documents.original_name AS document,
      1 - (
        document_chunks.embedding
        <=> $1::vector
      ) AS score

    FROM document_chunks

    INNER JOIN documents
      ON documents.id = document_chunks.document_id

    WHERE
      documents.organization_id = $2
      AND document_chunks.embedding IS NOT NULL
      AND (1 - (document_chunks.embedding <=> $1::vector)) >= $4

    ORDER BY
      document_chunks.embedding
      <=> $1::vector

    LIMIT $3
    `,
    [
      vector,
      organizationId,
      topK,
      threshold, // <-- Dodat parametar $4
    ],
  );

  return {
    query,
    results: rows.map((row: any) => ({
      content: row.content,
      document: row.document,
      page: Number(row.page_number),
      chunkIndex: Number(row.chunk_index),
      score: Number(row.score),
    })),
  };
}

private async generateAnswer(
  question: string,
  context: string,
): Promise<AiGenerationResponse> {

  const response =
    await firstValueFrom(
      this.httpService.post<AiGenerationResponse>(
        `${this.aiServiceUrl}/generate`,
        {
          question,
          context,
        },
        {
          timeout: 60000,
        },
      ),
    );

  return response.data;
}

private buildContext(
  results: DocumentSearchResult[],
): string {

  return results
    .map(
      (result, index) =>
        `[Source ${index + 1}]
Document: ${result.document}
Page: ${result.page}
Content:
${result.content}`,
    )
    .join('\n\n');
}

async ask(
  organizationId: string,
  query: string,
) {

  const searchResponse =
    await this.search(
      organizationId,
      query,
      5,
      0.70,
    );

  if (
    searchResponse.results.length === 0
  ) {

    return {
      query,
      answer:
        "Nemam dovoljno informacija u dostupnim dokumentima da odgovorim na ovo pitanje.",
      sources: [],
    };
  }

  const context =
    this.buildContext(
      searchResponse.results,
    );

  const generation =
    await this.generateAnswer(
      query,
      context,
    );

  return {
    query,
    answer: generation.answer,
    sources:
      searchResponse.results.map(
        (result) => ({
          document: result.document,
          page: result.page,
          score: result.score,
        }),
      ),
  };
}

// Unutar DocumentsService klase
async findOne(id: string, organizationId: string) {
  return this.documentsRepository.findOne({
    where: { id, organizationId },
  });
}

}