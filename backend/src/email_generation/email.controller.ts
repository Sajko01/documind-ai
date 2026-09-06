import {
  Body,
  Controller,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { EmailService } from './email.service';
import { GenerateEmailDto } from './dto/generate-email.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('AI Email')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard) // 🔒 Preporučeno: Zaključaj rutu da samo ulogovani korisnici mogu da generišu mejl
@Controller('ai')
export class EmailController {
  constructor(
    private readonly emailService: EmailService,
  ) {}

  @Post('generate-email')
  async generateEmail(
    @CurrentUser() user: JwtPayload, // 👈 Ako ti treba organizacija/korisnik
    @Body() dto: GenerateEmailDto,
  ) {
    // Možeš proslediti i user.organizationId u servis ako je potrebno
    return this.emailService.generateEmail(dto);
  }
}