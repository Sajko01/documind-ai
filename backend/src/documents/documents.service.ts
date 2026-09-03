// // import {
// //   Injectable,
// //   NotFoundException,
// // } from '@nestjs/common';

// // import { InjectRepository } from '@nestjs/typeorm';

// // import { Repository } from 'typeorm';

// // import { Document } from './entities/document.entity';

// // @Injectable()
// // export class DocumentsService {
// //   constructor(
// //     @InjectRepository(Document)
// //     private readonly documentsRepository:
// //       Repository<Document>,
// //   ) {}

// //   async delete(
// //     documentId: string,
// //     organizationId: string,
// //   ): Promise<void> {
// //     const document =
// //       await this.documentsRepository.findOne({
// //         where: {
// //           id: documentId,
// //           organizationId,
// //         },
// //       });

// //     if (!document) {
// //       throw new NotFoundException(
// //         'Document does not exist',
// //       );
// //     }

// //     await this.documentsRepository.remove(
// //       document,
// //     );
// //   }

// //   async findAll(
// //   organizationId: string,
// // ) {
// //   return this.documentsRepository.find({
// //     where: {
// //       organizationId,
// //     },
// //     order: {
// //       createdAt: 'DESC',
// //     },
// //   });
// // }
// // }

// import {
//   ForbiddenException,
//   Injectable,
//   NotFoundException,
// } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { CreateDocumentDto } from './dto/create-document.dto';
// import { Document } from './entities/document.entity';

// @Injectable()
// export class DocumentsService {
//   constructor(
//     @InjectRepository(Document)
//     private readonly documentsRepository: Repository<Document>,
//   ) {}

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

//   async findAll(organizationId: string): Promise<Document[]> {
//     // 🔒 Izolacija podataka: vraćaju se samo dokumenti koji pripadaju korisnikovoj organizaciji
//     return this.documentsRepository.find({
//       where: { organizationId },
//       order: { createdAt: 'DESC' },
//     });
//   }

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

//     // 🔒 Security Guard: Ako dokument pripada drugoj organizaciji, vraća 403 Forbidden
//     if (document.organizationId !== userOrganizationId) {
//       throw new ForbiddenException({
//         success: false,
//         error: {
//           code: 'FORBIDDEN_RESOURCE',
//           message: 'You do not have access to this document',
//         },
//       });
//     }

//     await this.documentsRepository.remove(document);

//     return {
//       success: true,
//       message: 'Document successfully deleted',
//     };
//   }
// }

// import type { Express } from 'express';
// import type { Multer } from 'multer'; // 👈 Osigurava prepoznavanje tipa

// import {
//   readFileSync,
// } from 'fs';

// import {
//   BadRequestException,
//   ForbiddenException,
//   Injectable,
//   NotFoundException,
// } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { existsSync, mkdirSync, unlinkSync, renameSync } from 'fs';
// import { join, basename } from 'path';
// import { randomUUID } from 'crypto';

// import { Document, DocumentStatus } from './entities/document.entity';
// import { CreateDocumentDto } from './dto/create-document.dto';

// @Injectable()
// export class DocumentsService {
//   private readonly tempDirectory = join(process.cwd(), 'uploads', 'tmp');
//   private readonly documentsDirectory = join(
//     process.cwd(),
//     'uploads',
//     'documents',
//   );

//   constructor(
//     @InjectRepository(Document)
//     private readonly documentsRepository: Repository<Document>,
//   ) {
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

//   // 1. Kreiranje tekstualnog dokumenta (zadržano iz starog koda)
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

//   // 2. Upload PDF fajla na disk (novo iz drugog fajla)
//   async upload(
//     file: Express.Multer.File,
//     organizationId: string,
//     createdById: string,
//   ): Promise<Document> {
//     if (!file) {
//       try {
//   this.validatePdfSignature(
//     file.path,
//   );
// } catch (error) {
//   this.deleteFileIfExists(
//     file.path,
//   );

//   throw error;
// }
//     }

//     const originalName = basename(file.originalname);

//     if (
//       !originalName.toLowerCase().endsWith('.pdf') ||
//       file.mimetype !== 'application/pdf'
//     ) {
//       this.deleteFileIfExists(file.path);
//       throw new BadRequestException('Only PDF files are allowed');
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
//     renameSync(file.path, finalPath);

//     const storagePath = `uploads/documents/${organizationId}/${filename}`;

//     try {
//       const document = this.documentsRepository.create({
//         id: documentId,
//         organizationId,
//         createdById,
//         filename,
//         originalName,
//         mimeType: file.mimetype,
//         size: file.size.toString(),
//         storagePath,
//         status: DocumentStatus.UPLOADED,
//       });

//       return await this.documentsRepository.save(document);
//     } catch (error) {
//       this.deleteFileIfExists(finalPath);
//       throw error;
//     }
//   }

//   // 3. Pretraga svih dokumenata za organizaciju (sa izolacijom)
//   async findAll(organizationId: string): Promise<Document[]> {
//     return this.documentsRepository.find({
//       where: { organizationId },
//       order: { createdAt: 'DESC' },
//     });
//   }

//   // 4. Brisanje dokumenta (spojena provera prava + brisanje sa diska)
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

//     // Fizičko brisanje fajla sa diska ako postoji putanja
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

//   private deleteFileIfExists(filePath: string): void {
//     if (existsSync(filePath)) {
//       unlinkSync(filePath);
//     }
//   }

//   private validatePdfSignature(
//   filePath: string,
// ): void {
//   const buffer =
//     readFileSync(
//       filePath,
//     );

//   const header =
//     buffer
//       .subarray(0, 5)
//       .toString('ascii');

//   if (header !== '%PDF-') {
//     throw new BadRequestException(
//       'Invalid PDF file',
//     );
//   }
// }
// }
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  existsSync,
  mkdirSync,
  unlinkSync,
  renameSync,
  readFileSync,
} from 'fs';
import { join, basename } from 'path';
import { randomUUID } from 'crypto';

import { Document, DocumentStatus } from './entities/document.entity';
import { CreateDocumentDto } from './dto/create-document.dto';

@Injectable()
export class DocumentsService {
  private readonly tempDirectory = join(process.cwd(), 'uploads', 'tmp');
  private readonly documentsDirectory = join(
    process.cwd(),
    'uploads',
    'documents',
  );

  constructor(
    @InjectRepository(Document)
    private readonly documentsRepository: Repository<Document>,
  ) {
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

  // 1. Kreiranje tekstualnog dokumenta
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

  // 2. Upload PDF fajla na disk (sa Magic Bytes proverom)
  async upload(
    file: Express.Multer.File,
    organizationId: string,
    createdById: string,
  ): Promise<Document> {
    if (!file || !file.path) {
      throw new BadRequestException('PDF file is required');
    }

    // 🔒 Validacija PDF Magic Bytes (%PDF-)
    try {
      this.validatePdfSignature(file.path);
    } catch (error) {
      this.deleteFileIfExists(file.path);
      throw error;
    }

    const originalName = basename(file.originalname);

    if (
      !originalName.toLowerCase().endsWith('.pdf') ||
      file.mimetype !== 'application/pdf'
    ) {
      this.deleteFileIfExists(file.path);
      throw new BadRequestException('Only PDF files are allowed');
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
    renameSync(file.path, finalPath);

    const storagePath = `uploads/documents/${organizationId}/${filename}`;

    try {
      const document = this.documentsRepository.create({
        id: documentId,
        organizationId,
        createdById,
        filename,
        originalName,
        mimeType: file.mimetype,
        size: file.size.toString(),
        storagePath,
        status: DocumentStatus.UPLOADED,
      });

      return await this.documentsRepository.save(document);
    } catch (error) {
      this.deleteFileIfExists(finalPath);
      throw error;
    }
  }

  // 3. Pretraga svih dokumenata za organizaciju
  async findAll(organizationId: string): Promise<Document[]> {
    return this.documentsRepository.find({
      where: { organizationId },
      order: { createdAt: 'DESC' },
    });
  }

  // 4. Brisanje dokumenta (provera prava + čišćenje sa diska)
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

  // Helper metoda za čišćenje fajla
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
}