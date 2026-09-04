export interface Product {

  id: string;

  organizationId: string;

  sku: string;

  name: string;

  description: string | null;

  category: string | null;

  price: number;

  stock: number;

  unit: string;

  active: boolean;

  createdAt: string;
}

export interface ProductsResponse {

  data: Product[];

  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}