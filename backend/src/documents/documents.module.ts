import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { DocumentChunk } from './entities/document-chunk.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Document } from './entities/document.entity';
import { HttpModule } from '@nestjs/axios';
import { AnalyticsModule } from 'src/analytics/analytics.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Document,
      DocumentChunk,
      // ❌ Ovde je bio AnalyticsModule i zato je puklo
    ]),
    HttpModule,
    AnalyticsModule, // ✅ AnalyticsModule ide ovde, u glavni imports niz modula!
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService],
  exports: [DocumentsService],
})
export class DocumentsModule {}