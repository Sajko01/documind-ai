import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { AnalyticsEvent } from './entities/analytics-event.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/users/entities/user.entity';
import { Document } from 'src/documents/entities/document.entity';
import { UnansweredQuestionsModule } from 'src/unanswered-questions/unanswered-questions.module';




@Module({
  imports: [TypeOrmModule.forFeature([
    AnalyticsEvent,
    User,
    Document,
    Product,
    //UnansweredQuestionsModule,

  ]),
  UnansweredQuestionsModule,

],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}