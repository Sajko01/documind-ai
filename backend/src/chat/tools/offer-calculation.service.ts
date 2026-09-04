import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';

import {
  ProductsService,
} from '../../products/products.service';

@Injectable()
export class OfferCalculationService {

  constructor(
    private readonly productsService:
      ProductsService,
  ) {}

  async calculate(
    organizationId: string,
    productId: string,
    quantity: number,
  ) {

    if (
      !Number.isInteger(quantity) ||
      quantity <= 0
    ) {
      throw new BadRequestException(
        'Quantity must be a positive integer',
      );
    }

    const product =
      await this.productsService.findOne(
        organizationId,
        productId,
      );

    if (!product.active) {
      throw new BadRequestException(
        'Product is inactive',
      );
    }

    if (
      product.stock < quantity
    ) {
      return {
        success: false,
        product: {
          id: product.id,
          sku: product.sku,
          name: product.name,
        },
        requestedQuantity: quantity,
        availableStock: product.stock,
        message:
          'There is not enough stock.',
      };
    }

    const unitPrice =
      Number(product.price);

    const subtotal =
      unitPrice * quantity;

    return {
      success: true,

      product: {
        id: product.id,
        sku: product.sku,
        name: product.name,
        unit: product.unit,
      },

      quantity,

      unitPrice,

      subtotal,

      currency: 'EUR',
    };
  }
}