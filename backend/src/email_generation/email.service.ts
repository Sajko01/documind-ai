import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import {
  ConfigService,
} from '@nestjs/config';

import {
  InjectRepository,
} from '@nestjs/typeorm';

import {
  Repository,
} from 'typeorm';

// Prilagodi putanju do tvoje Offer entitet klase
import { Offer } from '../offers/entities/offer.entity'; 

// 📊 Importi za analitiku
import {
  AnalyticsService,
} from '../analytics/analytics.service';

import {
  AnalyticsEventType,
} from '../analytics/enums/analytics-event-type.enum';

@Injectable()
export class EmailService {

  private readonly aiServiceUrl: string;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
    // 📊 Injektujemo AnalyticsService
    private readonly analyticsService: AnalyticsService,
  ) {
    this.aiServiceUrl =
      this.configService.get<string>(
        'AI_SERVICE_URL',
      ) || 'http://localhost:8000';
  }

  async generateEmail(
    data: {
      emailType: string;
      recipientName?: string;
      recipientEmail?: string;
      subject?: string;
      offerId?: string;
      context?: string;
      language?: string;
      tone?: string;
    },
  ) {
    try {
      let finalContext = data.context || '';
      let organizationId: string | undefined;

      // Ako je prosleđen offerId, automatski ga učitavamo iz baze
      if (data.offerId) {
        const offer = await this.offerRepository.findOne({
          where: { id: data.offerId },
          relations: {
            items: true,
          },
        });

        if (!offer) {
          throw new NotFoundException(`Offer with ID ${data.offerId} not found`);
        }

        // 💡 OVDE uzimamo organizationId direktno iz ponude!
        organizationId = offer.organizationId;

        // Sintetišemo bogat kontekst na osnovu ponude, stavki i kupca
        finalContext = `
Offer number: ${offer.offerNumber}
Customer: ${offer.customerName || 'N/A'}
Items:
${(offer as any).items?.map((item: any) => `
- Product: ${item.productName}
- Quantity: ${item.quantity}
- Unit price: ${item.unitPrice}
- Subtotal: ${item.subtotal}
`).join('\n') || 'No items'}

Total: ${offer.total} ${offer.currency || 'EUR'}
        `;
      }

      const response =
        await fetch(
          `${this.aiServiceUrl}/ai/generate-email`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email_type: data.emailType,
              recipient_name: data.recipientName,
              recipient_email: data.recipientEmail,
              subject: data.subject,
              context: finalContext,
              language: data.language || 'en',
              tone: data.tone || 'professional',
            }),
          },
        );

      if (!response.ok) {
        throw new Error(
          `AI service returned ${response.status}`,
        );
      }

      const result = await response.json();

      // 📊 Logovanje event-a (ako imamo organizationId iz ponude)
      if (organizationId) {
        await this.analyticsService.trackEvent({
          organizationId: organizationId,
          // userId: 'system-or-unknown', // ili ostavi ako ti userId nije neophodan / stavi null
          userId: undefined,
          eventType: AnalyticsEventType.EMAIL_GENERATED,
          metadata: {
            template: data.emailType,
          },
        });
      }

      return result;

    } catch (error) {
      console.error(
        'Email AI service error:',
        error,
      );

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to generate email',
      );
    }
  }
}