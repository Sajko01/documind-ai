import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { DocumentChunk } from './entities/document-chunk.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Document } from './entities/document.entity';
import { HttpModule } from '@nestjs/axios';



@Module({
  imports: [
    TypeOrmModule.forFeature([
      Document,
      DocumentChunk,
    ]),
     HttpModule,
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService],
  exports: [DocumentsService],
})
export class DocumentsModule {}