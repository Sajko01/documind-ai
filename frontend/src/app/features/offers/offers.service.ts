import {
  Injectable,
} from '@angular/core';

import {
  HttpClient,
} from '@angular/common/http';

import {
  Observable,
} from 'rxjs';

export interface OfferItem {

  id: string;

  productId: string;

  productName: string;

  sku: string;

  quantity: number;

  unitPrice: number;

  subtotal: number;
}

export interface Offer {

  id: string;

  offerNumber: string;

  customerName: string;

  customerEmail?: string;

  subtotal: number;

  total: number;

  currency: string;

  status: string;

  createdAt: string;

  items: OfferItem[];
}

@Injectable({
  providedIn: 'root',
})
export class OffersService {

  private readonly apiUrl =
    '/api/offers';

  constructor(
    private readonly http: HttpClient,
  ) {}

  getOffers(): Observable<Offer[]> {

    return this.http.get<Offer[]>(
      this.apiUrl,
    );
  }

  getOffer(
    id: string,
  ): Observable<Offer> {

    return this.http.get<Offer>(
      `${this.apiUrl}/${id}`,
    );
  }

  createOffer(
    data: {
      customerName: string;
      customerEmail?: string;
      items: {
        productId: string;
        quantity: number;
      }[];
    },
  ): Observable<Offer> {

    return this.http.post<Offer>(
      this.apiUrl,
      data,
    );
  }

  deleteOffer(
    id: string,
  ) {

    return this.http.delete(
      `${this.apiUrl}/${id}`,
    );
  }
}