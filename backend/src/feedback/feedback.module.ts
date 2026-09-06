import {
  Module,
} from '@nestjs/common';

import {
  TypeOrmModule,
} from '@nestjs/typeorm';

import {
  Feedback,
} from './entities/feedback.entity';

import {
  Message,
} from '../chat/entities/message.entity';

import {
  FeedbackService,
} from './feedback.service';



import {
  AnalyticsModule,
} from '../analytics/analytics.module';
import { FeedbackController } from './feedback.controller';


@Module({

  imports: [

    TypeOrmModule.forFeature([

      Feedback,

      Message,

    ]),

    AnalyticsModule,

  ],

  controllers: [
    FeedbackController,
  ],

  providers: [
    FeedbackService,
  ],

  exports: [
    FeedbackService,
  ],

})
export class FeedbackModule {}