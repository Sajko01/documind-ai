import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';

import {
  UnansweredQuestionsService,
} from './unanswered-questions.service';

import {
  JwtAuthGuard,
} from '../auth/guards/jwt-auth.guard';

import { 
  Roles 
} from 'src/auth/decorators/roles.decorator';

import { 
  UserRole 
} from 'src/users/entities/user.entity';

import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
// 👇 KLJUČNA IZMENA: Dodata reč 'type' jer je JwtPayload interfejs
import type { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

@Controller('unanswered-questions')
@UseGuards(JwtAuthGuard)
export class UnansweredQuestionsController {

  constructor(
    private readonly service: UnansweredQuestionsService,
  ) {}

  @Roles(UserRole.ADMIN)
  @Get()
  async findAll(
    @CurrentUser() user: JwtPayload, // Možeš i ovde koristiti JwtPayload umesto @Req()
  ) {
    return this.service.findAll(
      user.organizationId,
    );
  }

  // ✅ BEZBEDNO
  @Get('count')
  @UseGuards(JwtAuthGuard)
  async getOpenCount(@CurrentUser() user: JwtPayload) {
    const count = await this.service.count(user.organizationId);
    return { count };
  }
}