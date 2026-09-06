import {
  Injectable,
} from '@nestjs/common';

import {
  OffersService,
} from '../../offers/offers.service';

@Injectable()
export class OfferToolsService {

  constructor(
    private readonly offersService:
      OffersService,
  ) {}

  async createOffer(
    organizationId: string,
    userId: string, // 👈 Dodato ovde da bi se prosledilo u service
    args: Record<string, any>,
  ) {
    return this.offersService.create(
      organizationId,
      userId, // 👈 Prosleđujemo userId
      {
        customerName: args.customerName,
        customerEmail: args.customerEmail,
        items: args.items,
      },
    );
  }
}