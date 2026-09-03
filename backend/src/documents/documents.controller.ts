// import {
//   Controller,
//   Delete,
//   Get,
//   Param,
//   UseGuards,
// } from '@nestjs/common';
// import {
//   Request,
// } from '@nestjs/common';

// import { DocumentsService } from './documents.service';

// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { RolesGuard } from '../auth/guards/roles.guard';

// import { Roles } from '../auth/decorators/roles.decorator';

// import { UserRole } from '../users/entities/user.entity';
// import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
// import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

// @Controller('documents')
// export class DocumentsController {
//   constructor(
//     private readonly documentsService: DocumentsService,
//   ) {}

//   @Delete(':id')
// @UseGuards(
//   JwtAuthGuard,
//   RolesGuard,
// )
// @Roles(UserRole.ADMIN)
// delete(
//   @Param('id') id: string,
//   @Request() req: any,
// ) {
//   return this.documentsService.delete(
//     id,
//     req.user.organizationId,
//   );
// }

//     @Get()
//     @UseGuards(JwtAuthGuard)
//     findAll(
//     @CurrentUser() user: JwtPayload,
//     ) {
//     return this.documentsService.findAll(
//         user.organizationId,
//     );
//     }
// }

// import {
//   Body,
//   Controller,
//   Delete,
//   Get,
//   Param,
//   Post,
//   UnauthorizedException,
//   UseGuards,
// } from '@nestjs/common';
// import {
//   ApiBearerAuth,
//   ApiOperation,
//   ApiTags,
// } from '@nestjs/swagger';

// import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
// import { Roles } from 'src/auth/decorators/roles.decorator';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { RolesGuard } from '../auth/guards/roles.guard';
// import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
// import { UserRole } from '../users/entities/user.entity';

// import { DocumentsService } from './documents.service';
// import { CreateDocumentDto } from './dto/create-document.dto';

// @ApiTags('documents')
// @ApiBearerAuth() // 👈 Povezuje Swagger katanac i prosleđuje Bearer token
// @UseGuards(JwtAuthGuard, RolesGuard)
// @Controller('documents')
// export class DocumentsController {
//   constructor(
//     private readonly documentsService: DocumentsService,
//   ) {}

//   @Post()
//   @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
//   @ApiOperation({
//     summary: 'Create a new document for current organization',
//   })
//   async create(
//     @Body() dto: CreateDocumentDto,
//     @CurrentUser() user: JwtPayload & { userId?: string; id?: string },
//   ) {
//     const userId = user.sub || user.userId || user.id;

//     if (!userId) {
//       throw new UnauthorizedException('User ID missing from JWT token');
//     }

//     return await this.documentsService.create(
//       dto,
//       user.organizationId,
//       userId, // TypeScript sada zna da je ovo sigurno string
//     );
//   }

//   @Get()
//   @Roles(UserRole.ADMIN, UserRole.EMPLOYEE, UserRole.VIEWER)
//   @ApiOperation({
//     summary: 'Get all documents for current organization',
//   })
//   async findAll(
//     @CurrentUser() user: JwtPayload,
//   ) {
//     return this.documentsService.findAll(
//       user.organizationId,
//     );
//   }

//   @Delete(':id')
//   @Roles(UserRole.ADMIN)
//   @ApiOperation({
//     summary: 'Delete a document (ADMIN only)',
//   })
//   async delete(
//     @Param('id') id: string,
//     @CurrentUser() user: JwtPayload,
//   ) {
//     return this.documentsService.delete(
//       id,
//       user.organizationId,
//     );
//   }
// }

import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';

import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { UserRole } from '../users/entities/user.entity';

import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';

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

  // 2. Upload PDF fajla sa diskStorage i prowerom formata
  @Post('upload')
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
  @ApiOperation({
    summary: 'Upload a PDF document',
  })
  @ApiConsumes('multipart/form-data')
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
        fileSize: 10 * 1024 * 1024, // Limiz: 10 MB
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

  // 3. Preuzimanje svih dokumenata za organizaciju
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

  // 4. Brisanje dokumenta
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Delete a document (ADMIN only)',
  })
  async delete(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.documentsService.delete(id, user.organizationId);
  }
}