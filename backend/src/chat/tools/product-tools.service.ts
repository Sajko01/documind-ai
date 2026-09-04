import {
  Injectable,
} from '@nestjs/common';

import {
  ProductsService,
} from '../../products/products.service';
import { OfferCalculationService } from './offer-calculation.service';

@Injectable()
export class ProductToolsService {

  constructor(
    private readonly productsService:
      ProductsService,

        private readonly offerCalculationService:
    OfferCalculationService,
  ) {}

  async searchProducts(
    organizationId: string,
    args: Record<string, any>,
  ) {
    // Mapiramo i hvatamo sve moguće varijante koje Python može poslati
    const searchTerm = args.search || args.query || args.category || '';

    return this.productsService.findAll(
      organizationId,
      {
        search: searchTerm, // Siguran fallback
        sku: args.sku,
        category: args.category,
        minPrice: args.minPrice,
        maxPrice: args.maxPrice,
        minStock: args.minStock,
        maxStock: args.maxStock,
        active: args.active,
        page: 1,
        limit: args.limit ?? 10,
        sortBy: args.sortBy ?? 'name',
        sortOrder: args.sortOrder ?? 'ASC',
      },
    );
  }

  async getProduct(
  organizationId: string,
  args: Record<string, any>,
) {

  return this.productsService.findOne(
    organizationId,
    args.id,
  );
}

async calculateOffer(
  organizationId: string,
  args: Record<string, any>,
) {

  return this.offerCalculationService.calculate(
    organizationId,
    args.productId,
    Number(args.quantity),
  );
}
}