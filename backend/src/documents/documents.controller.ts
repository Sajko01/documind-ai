

import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Res,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import * as express from 'express';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { UserRole } from '../users/entities/user.entity';

import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { SearchDocumentsDto } from './dto/search-documents.dto';
import { AskDocumentDto } from './dto/ask-document.dto';
import { createReadStream, existsSync } from 'fs';

@ApiTags('documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  // 1. Kreiranje tekstualnog dokumenta
  @Post()
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
  @ApiOperation({
    summary: 'Create a new text-based document',
  })
  async create(
    @Body() dto: CreateDocumentDto,
    @CurrentUser() user: JwtPayload & { userId?: string; id?: string },
  ) {
    const userId = user.sub || user.userId || user.id;

    if (!userId) {
      throw new UnauthorizedException('User ID missing from JWT token');
    }

    return await this.documentsService.create(
      dto,
      user.organizationId,
      userId,
    );
  }

  // 2. Upload PDF fajla sa diskStorage i podrškom za Swagger upload
  @Post('upload')
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
  @ApiOperation({
    summary: 'Upload a PDF document',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'PDF file to upload',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/tmp',
        filename: (_req, file, callback) => {
          const extension = extname(file.originalname).toLowerCase();
          callback(null, `${randomUUID()}${extension}`);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // Limit: 10 MB
      },
      fileFilter: (_req, file, callback) => {
        const extension = extname(file.originalname).toLowerCase();

        if (extension !== '.pdf' || file.mimetype !== 'application/pdf') {
          return callback(
            new BadRequestException('Only PDF files are allowed'),
            false,
          );
        }

        callback(null, true);
      },
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: JwtPayload & { userId?: string; id?: string },
  ) {
    const userId = user.sub || user.userId || user.id;

    if (!userId) {
      throw new UnauthorizedException('User ID missing from JWT token');
    }

    const document = await this.documentsService.upload(
      file,
      user.organizationId,
      userId,
    );

    return {
      success: true,
      data: document,
    };
  }

  // 3. Pretraga dokumenata (RAG Vektorska pretraga)
  @Post('search')
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE, UserRole.VIEWER)
  @ApiOperation({
    summary: 'Search document vector store by semantic query',
  })
  async search(
    @CurrentUser() user: JwtPayload,
    @Body() dto: SearchDocumentsDto,
  ) {
    return this.documentsService.search(
      user.organizationId,
      dto.query,
      dto.topK ?? 5,
    );
  }

  // 4. Preuzimanje svih dokumenata za organizaciju
  @Get()
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE, UserRole.VIEWER)
  @ApiOperation({
    summary: 'Get all documents for current organization',
  })
  async findAll(@CurrentUser() user: JwtPayload) {
    const documents = await this.documentsService.findAll(
      user.organizationId,
    );

    return {
      success: true,
      data: documents,
    };
  }

  // 5. Preuzimanje svih chunk-ova za specifičan dokument
  @Get(':id/chunks')
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE, UserRole.VIEWER)
  @ApiOperation({
    summary: 'Get all processed chunks for a document',
  })
  async findChunks(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const chunks = await this.documentsService.findChunks(
      id,
      user.organizationId,
    );

    return {
      success: true,
      data: chunks,
    };
  }

  // 6. Brisanje dokumenta (ADMIN samo)
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Delete a document (ADMIN only)',
  })
  async delete(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.documentsService.delete(id, user.organizationId);
  }

  @Post('ask')
@UseGuards(JwtAuthGuard)
async ask(
  @CurrentUser() user: JwtPayload,
  @Body() dto: AskDocumentDto,
) {
  return this.documentsService.ask(
    user.organizationId,
    dto.query,
  );
}

// @Get(':id/file')
//   async getDocumentFile(
//     @Param('id') id: string,
//     @CurrentUser() user: any,
//     @Res() res: express.Response, // 👈 Korišćenje express.Response
//   ) {
//     // Zameniti 'findOne' tačnim imenom metode iz tvog DocumentsService-a
//     const document = await this.documentsService.findOne(id, user.organizationId);

//     if (!document) {
//       throw new NotFoundException('Document not found');
//     }

//     const filePath = document.filename || document.storagePath;

//     if (!filePath || !existsSync(filePath)) {
//       throw new NotFoundException('Physical file not found on server');
//     }

//     res.setHeader('Content-Type', 'application/pdf');
//     res.setHeader(
//       'Content-Disposition',
//       `inline; filename="${document.originalName || 'document.pdf'}"`,
//     );

//     const stream = createReadStream(filePath);
//     stream.pipe(res);
//   }
@Get(':id/file')
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE, UserRole.VIEWER)
  @ApiOperation({
    summary: 'Stream document PDF file',
  })
  async getDocumentFile(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Res() res: express.Response,
  ) {
    const organizationId = user.organizationId;

    if (!organizationId) {
      throw new UnauthorizedException('Organization ID missing from token');
    }

    // 1. Provera postojanja zapisa u bazi
    const document = await this.documentsService.findOne(id, organizationId);

    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found in database`);
    }

    // 2. Određivanje pune putanje do fajla
    // Ako čuvaš samo filename (npr. uuid.pdf), dodaj putanju do foldera (npr. './uploads/tmp/')
    let filePath = document.storagePath  || document.filename;

    if (filePath && !filePath.includes('/') && !filePath.includes('\\')) {
      filePath = `./uploads/tmp/${filePath}`;
    }

    // 3. Provera da li fajl fizički postoji na disku
    if (!filePath || !existsSync(filePath)) {
      throw new NotFoundException(`Physical file missing at path: ${filePath}`);
    }

    // 4. Postavljanje zaglavlja i slanje fajla
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${document.originalName || 'document.pdf'}"`,
    );

    const stream = createReadStream(filePath);
    stream.pipe(res);
  }
}