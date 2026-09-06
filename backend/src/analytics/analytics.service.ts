import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AnalyticsEvent } from './entities/analytics-event.entity';
import { AnalyticsEventType } from './enums/analytics-event-type.enum';
import { User } from 'src/users/entities/user.entity';
import { Product } from 'src/products/entities/product.entity';
import { Document } from 'src/documents/entities/document.entity';
import { UnansweredQuestionsService } from 'src/unanswered-questions/unanswered-questions.service';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(AnalyticsEvent)
    private readonly analyticsRepository: Repository<AnalyticsEvent>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    private readonly unansweredQuestionsService: UnansweredQuestionsService,
  ) {}

  async trackEvent(data: {
    organizationId: string;
    userId?: string;
    eventType: AnalyticsEventType;
    documentId?: string;
    conversationId?: string;
    responseTimeMs?: number;
    retrievalScore?: number;
    metadata?: Record<string, any>;
  }) {
    const event = this.analyticsRepository.create({
      organizationId: data.organizationId,
      userId: data.userId ?? null,
      eventType: data.eventType,
      documentId: data.documentId ?? null,
      conversationId: data.conversationId ?? null,
      responseTimeMs: data.responseTimeMs ?? null,
      retrievalScore: data.retrievalScore ?? null,
      metadata: data.metadata ?? null,
    });

    return this.analyticsRepository.save(event);
  }

  async getDashboard(organizationId: string) {
    const [
      totalUsers,
      totalDocuments,
      totalQuestions,
      totalProducts,
      unansweredQuestions,
      aiMetrics,
    ] = await Promise.all([
      this.getTotalUsers(organizationId),
      this.getTotalDocuments(organizationId),
      this.getTotalQuestions(organizationId),
      this.getTotalProducts(organizationId),
      this.unansweredQuestionsService.count(organizationId),
      this.getAiMetrics(organizationId),
    ]);

    return {
      totalUsers,
      totalDocuments,
      totalQuestions,
      totalProducts,
      unansweredQuestions,
      averageResponseTime: aiMetrics.averageResponseTime.averageResponseTime,
      averageRetrievalScore: aiMetrics.averageRetrievalScore,
    };
  }

  private async getTotalUsers(organizationId: string) {
    return this.userRepository.count({
      where: {
        organizationId,
      },
    });
  }

  private async getTotalDocuments(organizationId: string) {
    return this.documentRepository.count({
      where: {
        organizationId,
      },
    });
  }

  private async getTotalProducts(organizationId: string) {
    return this.productRepository.count({
      where: {
        organizationId,
      },
    });
  }

  private async getTotalQuestions(organizationId: string) {
    return this.analyticsRepository.count({
      where: {
        organizationId,
        eventType: AnalyticsEventType.QUESTION_ASKED,
      },
    });
  }

  async getAverageResponseTime(organizationId: string) {
    const result = await this.analyticsRepository
      .createQueryBuilder('event')
      .select('AVG(event.response_time_ms)', 'averageResponseTime')
      .where('event.organization_id = :organizationId', {
        organizationId,
      })
      .andWhere('event.event_type = :eventType', {
        eventType: AnalyticsEventType.QUESTION_ASKED,
      })
      .andWhere('event.response_time_ms IS NOT NULL')
      .getRawOne();

    return {
      averageResponseTime: Number(result?.averageResponseTime ?? 0),
    };
  }

  async getAverageRetrievalScore(organizationId: string) {
    const result = await this.analyticsRepository
      .createQueryBuilder('event')
      .select('AVG(event.retrieval_score)', 'averageRetrievalScore')
      .where('event.organization_id = :organizationId', {
        organizationId,
      })
      .andWhere('event.event_type = :eventType', {
        eventType: AnalyticsEventType.QUESTION_ASKED,
      })
      .andWhere('event.retrieval_score IS NOT NULL')
      .getRawOne();

    return Number(result?.averageRetrievalScore ?? 0);
  }

  async getAiMetrics(organizationId: string) {
    const responseTime = await this.getAverageResponseTime(organizationId);
    const retrievalScore = await this.getAverageRetrievalScore(organizationId);

    return {
      averageResponseTime: responseTime,
      averageRetrievalScore: retrievalScore,
    };
  }

  async getPopularDocuments(organizationId: string) {
    const query = `
      SELECT 
        document->>'documentId' AS "documentId",
        document->>'filename' AS "filename",
        COUNT(*)::int AS count
      FROM "analytics_events" "event",
           jsonb_array_elements("event"."metadata"->'retrievedDocuments') AS document
      WHERE "event"."organization_id" = $1
        AND "event"."event_type" = 'question_asked'
      GROUP BY document->>'documentId', document->>'filename'
      ORDER BY count DESC
      LIMIT 10;
    `;

    const result = await this.analyticsRepository.query(query, [organizationId]);
    return result;
  }

  async getPopularQuestions(organizationId: string) {
    const events = await this.analyticsRepository
      .createQueryBuilder('event')
      .select("event.metadata->>'question'", 'question')
      .addSelect('COUNT(*)', 'count')
      .where('event.organization_id = :organizationId', {
        organizationId,
      })
      .andWhere('event.event_type = :eventType', {
        eventType: AnalyticsEventType.QUESTION_ASKED,
      })
      .andWhere("event.metadata->>'question' IS NOT NULL")
      .groupBy("event.metadata->>'question'")
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    return events.map((event) => ({
      question: event.question,
      count: Number(event.count),
    }));
  }
}