import { forwardRef, Module } from '@nestjs/common';
import { OffersController } from './offers.controller';
import { OffersService } from './offers.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Offer } from './entities/offer.entity';
import { OfferItem } from './entities/offer-item.entity';
import { ProductsModule } from 'src/products/products.module';
import { ChatModule } from 'src/chat/chat.module';




@Module({
 imports: [
    TypeOrmModule.forFeature([
      Offer,
      OfferItem,
    ]),
    forwardRef(() => ChatModule),

    ProductsModule,
  ],
  controllers: [OffersController],
  providers: [OffersService],
  exports: [OffersService],
})
export class OffersModule {}