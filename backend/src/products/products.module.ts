import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OfferCalculationService } from 'src/chat/tools/offer-calculation.service';



@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  controllers: [ProductsController],
  providers: [ProductsService,OfferCalculationService],
  exports: [ProductsService,OfferCalculationService],
})
export class ProductsModule {}