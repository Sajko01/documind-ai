import {
  Module,
} from '@nestjs/common';

import {
  TypeOrmModule,
} from '@nestjs/typeorm';

import {
  UnansweredQuestion,
} from './entities/unanswered-question.entity';

import {
  UnansweredQuestionsService,
} from './unanswered-questions.service';

import {
  UnansweredQuestionsController,
} from './unanswered-questions.controller';


@Module({

  imports: [

    TypeOrmModule.forFeature([
      UnansweredQuestion,
    ]),

  ],

  controllers: [
    UnansweredQuestionsController,
  ],

  providers: [
    UnansweredQuestionsService,
  ],

  exports: [
    UnansweredQuestionsService,
  ],

})
export class UnansweredQuestionsModule {}