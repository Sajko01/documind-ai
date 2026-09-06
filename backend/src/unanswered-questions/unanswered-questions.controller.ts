import {
  Controller,
  Get,
  Param,
  Req,
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
} from 'src/users/entities/user.entity'; // Proveri da li je putanja tačna za tvoj projekat


@Controller('unanswered-questions')
@UseGuards(JwtAuthGuard)
export class UnansweredQuestionsController {

  constructor(
    private readonly service: UnansweredQuestionsService,
  ) {}


  @Roles(UserRole.ADMIN)
  @Get()
  async findAll(
    @Req() req: any,
  ) {

    return this.service.findAll(
      req.user.organizationId,
    );

  }


  // Definišemo GET endpoint: GET /unanswered-questions/count/:organizationId
  @Get('count/:organizationId')
  async getOpenCount(@Param('organizationId') organizationId: string) {
    const count = await this.service.count(organizationId);
    return { count }; // Vraća JSON: { "count": 5 }
  }
}