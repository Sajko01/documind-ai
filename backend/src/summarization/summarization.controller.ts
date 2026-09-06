import {
  Body,
  Controller,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import {
  SummarizationService,
} from './summarization.service';

import {
  GenerateDocumentSummaryDto,
} from './dto/generate-document-summary.dto';

import {
  JwtAuthGuard,
} from '../auth/guards/jwt-auth.guard';
import { GenerateConversationSummaryDto } from './dto/generate-conversation-summary.dto';


@Controller('documents')
@UseGuards(JwtAuthGuard)
export class SummarizationController {

  constructor(
    private readonly summarizationService:
      SummarizationService,
  ) {}


  @Post(':id/summary')
  async generateSummary(

    @Param('id')
    documentId: string,

    @Body()
    dto: GenerateDocumentSummaryDto,

    @Req()
    req: any,
  ) {

    return this.summarizationService
      .generateDocumentSummary(
        documentId,
        req.user.organizationId,
        dto.language || 'en',
      );
  }


  @Post(
  'conversations/:id/summary',
)
async generateConversationSummary(

  @Param('id')
  conversationId: string,

  @Body()
  dto: GenerateConversationSummaryDto,

  @Req()
  req: any,
) {

  return this.summarizationService
    .generateConversationSummary(
      conversationId,
      req.user.organizationId,
      dto.language || 'en',
    );
}
}