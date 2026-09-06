import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  InjectRepository,
} from '@nestjs/typeorm';

import {
  Repository,
} from 'typeorm';

import {
  Offer,
} from './entities/offer.entity';

import {
  OfferItem,
} from './entities/offer-item.entity';

import {
  OfferStatus,
} from './entities/offer-status.enum';

import {
  CreateOfferDto,
} from './dto/create-offer.dto';

import {
  ProductsService,
} from '../products/products.service';

// 📊 Importi za analitiku
import {
  AnalyticsService,
} from '../analytics/analytics.service';

import {
  AnalyticsEventType,
} from '../analytics/enums/analytics-event-type.enum';

@Injectable()
export class OffersService {

  constructor(
    @InjectRepository(Offer)
    private readonly offerRepository:
      Repository<Offer>,

    @InjectRepository(OfferItem)
    private readonly offerItemRepository:
      Repository<OfferItem>,

    private readonly productsService:
      ProductsService,

    // 📊 Injektujemo AnalyticsService
    private readonly analyticsService:
      AnalyticsService,
  ) {}

  async create(
    organizationId: string,
    userId: string, // 👈 Dodat userId da bismo ga evidentirali u analitici
    dto: CreateOfferDto,
  ) {
    if (
      !dto.items ||
      dto.items.length === 0
    ) {
      throw new BadRequestException(
        'Offer must contain at least one item',
      );
    }

    let total = 0;
    
    // 1. Definišemo jasan interfejs/tip za stavke pre čuvanja
    const validatedItems: Array<{
      productId: string;
      productName: string;
      sku: string;
      quantity: number;
      unitPrice: number;
      subtotal: number;
    }> = [];

    // 2. Provera proizvoda i računanje iznosa
    for (const itemDto of dto.items) {
      const product =
        await this.productsService.findOne(
          organizationId,
          itemDto.productId,
        );

      if (!product.active) {
        throw new BadRequestException(
          `Product ${product.name} is inactive`,
        );
      }

      if (
        product.stock < itemDto.quantity
      ) {
        throw new BadRequestException(
          `Not enough stock for ${product.name}`,
        );
      }

      const unitPrice = Number(product.price);
      const subtotal = unitPrice * itemDto.quantity;
      total += subtotal;

      validatedItems.push({
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        quantity: itemDto.quantity,
        unitPrice,
        subtotal,
      });
    }

    // 3. Prvo snimamo SAMU PONUDU da dobijemo njen ID u bazi
    const offer = this.offerRepository.create({
      organizationId,
      offerNumber: await this.generateOfferNumber(),
      customerName: dto.customerName,
      customerEmail: dto.customerEmail,
      subtotal: total,
      total,
      currency: 'EUR',
      status: OfferStatus.DRAFT,
    });

    const savedOffer = await this.offerRepository.save(offer);

    // 4. Pravimo entitete stavki pravilno bez ugnježdenih nizova
    const itemEntities = validatedItems.map(itemData =>
      this.offerItemRepository.create({
        productId: itemData.productId,
        productName: itemData.productName,
        sku: itemData.sku,
        quantity: itemData.quantity,
        unitPrice: itemData.unitPrice,
        subtotal: itemData.subtotal,
        offer: savedOffer, // Povezujemo sa sačuvanom ponudom
      }),
    );

    await this.offerItemRepository.save(itemEntities);

    // 📊 5. Logovanje event-a da je ponuda uspešno kreirana
    await this.analyticsService.trackEvent({
      organizationId: organizationId,
      userId: userId,
      eventType: AnalyticsEventType.OFFER_CREATED,
      metadata: {
        offerId: savedOffer.id,
        total: savedOffer.total,
      },
    });

    // 6. Vraćamo kompletnu ponudu sa stavkama
    return this.findOne(
      organizationId,
      savedOffer.id,
    );
  }


  private async generateOfferNumber() {
    const count =
      await this.offerRepository.count();

    const nextNumber =
      count + 1;

    return `OFF-${new Date().getFullYear()}-${String(
      nextNumber,
    ).padStart(4, '0')}`;
  }

  async findAll(
    organizationId: string,
  ) {
    return this.offerRepository.find({
      where: {
        organizationId,
      },

      relations: {
        items: true,
      },

      order: {
        createdAt: 'DESC',
      },
    });
  }


  async findOne(
    organizationId: string,
    id: string,
  ) {
    const offer =
      await this.offerRepository.findOne({
        where: {
          id,
          organizationId,
        },

        relations: {
          items: true,
        },
      });

    if (!offer) {
      throw new NotFoundException(
        'Offer not found',
      );
    }

    return offer;
  }

  async update(
    organizationId: string,
    id: string,
    dto: Partial<CreateOfferDto>,
  ) {
    const offer =
      await this.findOne(
        organizationId,
        id,
      );

    if (
      offer.status !== OfferStatus.DRAFT
    ) {
      throw new BadRequestException(
        'Only draft offers can be updated',
      );
    }

    if (dto.customerName !== undefined) {
      offer.customerName =
        dto.customerName;
    }

    if (dto.customerEmail !== undefined) {
      offer.customerEmail =
        dto.customerEmail;
    }

    return this.offerRepository.save(
      offer,
    );
  }

  async remove(
    organizationId: string,
    id: string,
  ) {
    const offer =
      await this.findOne(
        organizationId,
        id,
      );

    if (
      offer.status !== OfferStatus.DRAFT
    ) {
      throw new BadRequestException(
        'Only draft offers can be deleted',
      );
    }

    await this.offerRepository.remove(
      offer,
    );

    return {
      success: true,
    };
  }
}