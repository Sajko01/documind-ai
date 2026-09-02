import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { DocumentChunk } from './entities/document-chunk.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Document } from './entities/document.entity';



@Module({
  imports: [
    TypeOrmModule.forFeature([
      Document,
      DocumentChunk,
    ]),
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService],
  exports: [DocumentsService],
})
export class DocumentsModule {}