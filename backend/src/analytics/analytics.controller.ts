import {
  Controller,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';

import {
  AnalyticsService,
} from './analytics.service';

import {
  JwtAuthGuard,
} from '../auth/guards/jwt-auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/entities/user.entity';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';


@ApiTags('Analytics')
@ApiBearerAuth()
@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard) // 1. Dodaješ i RolesGuard ovde
@Roles(UserRole.ADMIN)                     // 2. Zaključavaš ceo kontroler samo za ADMIN-e
export class AnalyticsController {

  constructor(
    private readonly analyticsService:
      AnalyticsService,
  ) {}


  @Get('dashboard')
  async getDashboard(
    @Req() req: any,
  ) {

    return this.analyticsService
      .getDashboard(
        req.user.organizationId,
      );
  }

  @Get('ai')
async getAiMetrics(
  @Req() req: any,
) {

  return this.analyticsService
    .getAiMetrics(
      req.user.organizationId,
    );
}
@Get('popular-questions')
async getPopularQuestions(
  @Req() req: any,
) {

  return this.analyticsService
    .getPopularQuestions(
      req.user.organizationId,
    );
}

@Get('popular-documents')
async getPopularDocuments(
  @Req() req: any,
) {

  return this.analyticsService
    .getPopularDocuments(
      req.user.organizationId,
    );
}
}