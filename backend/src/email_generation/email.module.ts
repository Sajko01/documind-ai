import {
  Module,
} from '@nestjs/common';

import {
  EmailController,
} from './email.controller';

import {
  EmailService,
} from './email.service';
import { OffersModule } from 'src/offers/offers.module';
import { AnalyticsModule } from 'src/analytics/analytics.module';

@Module({

    imports: [
    // Opcija A: Ako OffersModule eksportuje TypeORM repozitorijum, uvezi sam modul:
     OffersModule,

    // Opcija B: Direktno registruj Offer entitet u EmailModule-u:
    //TypeOrmModule.forFeature([Offer]),
    AnalyticsModule,
  ],

  controllers: [
    EmailController,
  ],

  providers: [
    EmailService,
  ],

  exports: [
    EmailService,
  ],
})
export class EmailModule {}