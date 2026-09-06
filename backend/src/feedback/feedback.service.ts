import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  InjectRepository,
} from '@nestjs/typeorm';

import {
  Repository,
} from 'typeorm';

import {
  Feedback,
} from './entities/feedback.entity';

import {
  CreateFeedbackDto,
} from './dto/create-feedback.dto';

import {
  FeedbackRating,
} from './enums/feedback-rating.enum';

import {
  Message,
} from '../chat/entities/message.entity';

import {
  AnalyticsService,
} from '../analytics/analytics.service';

import {
  AnalyticsEventType,
} from '../analytics/enums/analytics-event-type.enum';

@Injectable()
export class FeedbackService {

  constructor(

    @InjectRepository(Feedback)
    private readonly feedbackRepository:
      Repository<Feedback>,

    @InjectRepository(Message)
    private readonly messageRepository:
      Repository<Message>,

    private readonly analyticsService:
      AnalyticsService,

  ) {}

async createFeedback(
  organizationId: string,
  userId: string,
  dto: CreateFeedbackDto,
) {

  const message =
    await this.messageRepository.findOne({

      where: {
        id: dto.messageId,
      },

      relations: {
        conversation: true,
      },

    });


  if (
    !message ||
    message.conversation.organizationId !==
      organizationId
  ) {

    throw new NotFoundException(
      'Message does not exist',
    );

  }


  if (
    message.role !== 'assistant'
  ) {

    throw new BadRequestException(
      'Feedback can only be submitted for assistant messages',
    );

  }


  const existingFeedback =
    await this.feedbackRepository.findOne({

      where: {

        messageId:
          dto.messageId,

        userId,

      },

    });


  if (existingFeedback) {

    throw new BadRequestException(
      'Feedback has already been submitted for this message',
    );

  }


  const feedback =
    this.feedbackRepository.create({

      organizationId,

      messageId:
        dto.messageId,

      userId,

      rating:
        dto.rating,

      reason:
        dto.reason ?? null,

    });


  const savedFeedback =
    await this.feedbackRepository.save(
      feedback,
    );


  await this.analyticsService.trackEvent({

    organizationId,

    userId,

    eventType:
      AnalyticsEventType.FEEDBACK_GIVEN,

    conversationId:
      message.conversationId,

    metadata: {

      messageId:
        dto.messageId,

      rating:
        dto.rating,

      reason:
        dto.reason ?? null,

    },

  });


  return {

    success: true,

    feedback: {

      id:
        savedFeedback.id,

      messageId:
        savedFeedback.messageId,

      rating:
        savedFeedback.rating,

      reason:
        savedFeedback.reason,

      createdAt:
        savedFeedback.createdAt,

    },

  };
}

async getStatistics(
  organizationId: string,
) {

  const total =
    await this.feedbackRepository.count({

      where: {
        organizationId,
      },

    });


  const positive =
    await this.feedbackRepository.count({

      where: {

        organizationId,

        rating:
          FeedbackRating.POSITIVE,

      },

    });


  const negative =
    await this.feedbackRepository.count({

      where: {

        organizationId,

        rating:
          FeedbackRating.NEGATIVE,

      },

    });


  return {

    total,

    positive,

    negative,

    positivePercentage:
      total > 0
        ? Number(
            (
              (positive / total) *
              100
            ).toFixed(1),
          )
        : 0,

    negativePercentage:
      total > 0
        ? Number(
            (
              (negative / total) *
              100
            ).toFixed(1),
          )
        : 0,

  };
}
}