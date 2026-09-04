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
    args: Record<string, any>,
  ) {

    return this.offersService.create(
      organizationId,
      {
        customerName:
          args.customerName,

        customerEmail:
          args.customerEmail,

        items:
          args.items,
      },
    );
  }
}