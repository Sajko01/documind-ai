import { forwardRef, Module } from '@nestjs/common';
import { OffersController } from './offers.controller';
import { OffersService } from './offers.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Offer } from './entities/offer.entity';
import { OfferItem } from './entities/offer-item.entity';
import { ProductsModule } from 'src/products/products.module';
import { ChatModule } from 'src/chat/chat.module';
import { AnalyticsModule } from 'src/analytics/analytics.module';




@Module({
 imports: [
    TypeOrmModule.forFeature([
      Offer,
      OfferItem,
    ]),
    forwardRef(() => ChatModule),
    AnalyticsModule,

    ProductsModule,
  ],
  controllers: [OffersController],
  providers: [OffersService],
  exports: [OffersService, TypeOrmModule],
})
export class OffersModule {}