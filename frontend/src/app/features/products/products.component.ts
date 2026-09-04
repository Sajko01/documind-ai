import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpParams } from '@angular/common/http';

import { ProductsService } from './products.service';
import { Product } from './product.model';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  loading = false;
  error: string | null = null;

  // Filter Atributi (DAN 68)
  search = '';
  sku = '';
  category = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  minStock: number | null = null;
  maxStock: number | null = null;
  active: boolean | null = null;

  // Pagination Properties (DAN 69)
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;
  totalProducts = 0;

  // 69.1. Sorting Properties
  sortBy = 'createdAt';
  sortOrder: 'ASC' | 'DESC' = 'DESC';

  constructor(private readonly productsService: ProductsService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.error = null;

    let params = new HttpParams();

    // Pagination params
    params = params.set('page', this.currentPage);
    params = params.set('limit', this.pageSize);

    // 69.2. Sorting params
    params = params.set('sortBy', this.sortBy);
    params = params.set('sortOrder', this.sortOrder);

    // Filter params
    if (this.search) {
      params = params.set('search', this.search);
    }

    if (this.sku) {
      params = params.set('sku', this.sku);
    }

    if (this.category) {
      params = params.set('category', this.category);
    }

    if (this.minPrice !== null) {
      params = params.set('minPrice', this.minPrice);
    }

    if (this.maxPrice !== null) {
      params = params.set('maxPrice', this.maxPrice);
    }

    if (this.minStock !== null) {
      params = params.set('minStock', this.minStock);
    }

    if (this.maxStock !== null) {
      params = params.set('maxStock', this.maxStock);
    }

    if (this.active !== null) {
      params = params.set('active', this.active);
    }

    this.productsService.getProducts(params).subscribe({
      next: (response) => {
        this.products = response.data;

        // Pagination response mapping
        this.currentPage = response.pagination.page;
        this.pageSize = response.pagination.limit;
        this.totalPages = response.pagination.totalPages;
        this.totalProducts = response.pagination.total;

        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load products', error);
        this.error = 'Failed to load products';
        this.loading = false;
      },
    });
  }

  // 69.3. Sort method
  sort(field: string): void {
    if (this.sortBy === field) {
      this.sortOrder = this.sortOrder === 'ASC' ? 'DESC' : 'ASC';
    } else {
      this.sortBy = field;
      this.sortOrder = 'ASC';
    }

    this.currentPage = 1;

    this.loadProducts();
  }

  // Pagination methods
  previousPage(): void {
    if (this.currentPage <= 1) {
      return;
    }

    this.currentPage--;

    this.loadProducts();
  }

  nextPage(): void {
    if (this.currentPage >= this.totalPages) {
      return;
    }

    this.currentPage++;

    this.loadProducts();
  }

  changePageSize(): void {
    this.currentPage = 1;

    this.loadProducts();
  }

  resetFilters(): void {
    this.search = '';
    this.sku = '';
    this.category = '';
    this.minPrice = null;
    this.maxPrice = null;
    this.minStock = null;
    this.maxStock = null;
    this.active = null;
    this.currentPage = 1;
    this.sortBy = 'createdAt';
    this.sortOrder = 'DESC';

    this.loadProducts();
  }

  deleteProduct(product: Product): void {
    const confirmed = window.confirm(`Delete "${product.name}"?`);

    if (!confirmed) {
      return;
    }

    this.productsService.deleteProduct(product.id).subscribe({
      next: () => {
        this.loadProducts();
      },
      error: (error) => {
        console.error('Failed to delete product', error);
      },
    });
  }
}