import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import {
  FeedbackService,
} from './feedback.service';

import {
  CreateFeedbackDto,
} from './dto/create-feedback.dto';

import {
  JwtAuthGuard,
} from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/entities/user.entity';

@ApiTags('Feedback')
@ApiBearerAuth()
@Controller('feedback')
@UseGuards(JwtAuthGuard)
export class FeedbackController {

  constructor(
    private readonly feedbackService: FeedbackService,
  ) {}

  @Post()
  async create(
    @Req() req: any,
    @Body() dto: CreateFeedbackDto,
  ) {
    return this.feedbackService.createFeedback(
      req.user.organizationId,
      req.user.userId,
      dto,
    );
  }

  @Roles(UserRole.ADMIN)
  @Get('statistics')
  async getStatistics(
    @Req() req: any,
  ) {
    return this.feedbackService.getStatistics(
      req.user.organizationId,
    );
  }
}