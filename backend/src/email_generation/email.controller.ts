import {
  Body,
  Controller,
  Post,
} from '@nestjs/common';

import {
  EmailService,
} from './email.service';

import {
  GenerateEmailDto,
} from './dto/generate-email.dto';

@Controller('ai')
export class EmailController {

  constructor(
    private readonly emailService:
      EmailService,
  ) {}

@Post('generate-email')
  async generateEmail(
    @Body() dto: GenerateEmailDto,
  ) {
    return this.emailService.generateEmail(dto);
  }
}