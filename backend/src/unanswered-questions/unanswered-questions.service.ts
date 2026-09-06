import {
  Injectable,
} from '@nestjs/common';

import {
  InjectRepository,
} from '@nestjs/typeorm';

import {
  Repository,
} from 'typeorm';

import {
  UnansweredQuestion,
} from './entities/unanswered-question.entity';

import {
  UnansweredQuestionStatus,
} from './enums/unanswered-question-status.enum';

@Injectable()
export class UnansweredQuestionsService {

  constructor(

    @InjectRepository(
      UnansweredQuestion,
    )
    private readonly repository:
      Repository<UnansweredQuestion>,

  ) {}

async create(
  organizationId: string,
  userId: string,
  data: {
    question: string;
    confidence: number;
    conversationId?: string;
    messageId?: string;
  },
) {

  const unanswered =
    this.repository.create({

      organizationId,

      userId,

      conversationId:
        data.conversationId ?? null,

      messageId:
        data.messageId ?? null,

      question:
        data.question,

      confidence:
        data.confidence,

      status:
        UnansweredQuestionStatus.OPEN,

    });


  return this.repository.save(
    unanswered,
  );
}


async findAll(
  organizationId: string,
) {

  return this.repository.find({

    where: {
      organizationId,
    },

    order: {
      createdAt: 'DESC',
    },

  });

}

async count(
  organizationId: string,
) {

  return this.repository.count({

    where: {

      organizationId,

      status:
        UnansweredQuestionStatus.OPEN,

    },

  });

}
}