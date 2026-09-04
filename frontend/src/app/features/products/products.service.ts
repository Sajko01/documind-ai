import {
  Injectable,
} from '@angular/core';

import {
  HttpClient,
  HttpParams,
} from '@angular/common/http';

import {
  Observable,
} from 'rxjs';

import {
  Product,
  ProductsResponse,
} from './product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {

  private readonly apiUrl =
    'http://localhost:3000/api/products';

  constructor(
    private readonly http:
      HttpClient,
  ) {}

  getProducts(
    params?: HttpParams,
  ): Observable<ProductsResponse> {

    return this.http.get<ProductsResponse>(
      this.apiUrl,
      {
        params,
      },
    );
  }

  getProduct(
    id: string,
  ): Observable<Product> {

    return this.http.get<Product>(
      `${this.apiUrl}/${id}`,
    );
  }

  createProduct(
    product: Partial<Product>,
  ): Observable<Product> {

    return this.http.post<Product>(
      this.apiUrl,
      product,
    );
  }

  updateProduct(
    id: string,
    product: Partial<Product>,
  ): Observable<Product> {

    return this.http.patch<Product>(
      `${this.apiUrl}/${id}`,
      product,
    );
  }

  deleteProduct(
    id: string,
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.apiUrl}/${id}`,
    );
  }
}