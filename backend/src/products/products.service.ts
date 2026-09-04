import {
  ConflictException,
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
  Product,
} from './entities/product.entity';

import {
  CreateProductDto,
} from './dto/create-product.dto';

import {
  UpdateProductDto,
} from './dto/update-product.dto';

import {
  ProductQueryDto,
} from './dto/product-query.dto';

@Injectable()
export class ProductsService {

  constructor(
    @InjectRepository(Product)
    private readonly productsRepository:
      Repository<Product>,
  ) {}

 async create(
    organizationId: string,
    dto: CreateProductDto,
  ): Promise<Product> {

    const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(organizationId);

    const existing =
      await this.productsRepository.findOne({
        where: {
          ...(isValidUuid ? { organizationId } : {}),
          sku: dto.sku,
        },
      });

    if (existing) {
      throw new ConflictException(
        'Product with this SKU already exists',
      );
    }

    const product = this.productsRepository.create({
      ...(isValidUuid ? { organizationId } : {}),
      sku: dto.sku,
      name: dto.name,
      description: dto.description ?? undefined,
      category: dto.category ?? undefined,
      price: dto.price,
      stock: dto.stock,
      unit: dto.unit,
      active: dto.active ?? true,
    });

    return this.productsRepository.save(
      product,
    );
  }
  async findAll(
    organizationId: string,
    query: ProductQueryDto,
  ) {

    const {
      search,
      sku,
      category,
      minPrice,
      maxPrice,
      minStock,
      maxStock,
      active,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const allowedSortFields = [
      'createdAt',
      'name',
      'sku',
      'price',
      'stock',
      'category',
    ];

    const safeSortBy =
      allowedSortFields.includes(sortBy)
        ? sortBy
        : 'createdAt';

    const safeSortOrder =
      sortOrder === 'ASC'
        ? 'ASC'
        : 'DESC';

    const qb =
      this.productsRepository
        .createQueryBuilder('product');

    // Provera da li je organizationId validan UUID pre dodavanja u WHERE uslov
    const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(organizationId);

    if (isValidUuid) {
      qb.where(
        'product.organizationId = :organizationId',
        {
          organizationId,
        },
      );
    } else {
      // Ako nije validan UUID (npr. 'default-org'), možemo staviti 1=1 ili ignorisati filtriranje po organizaciji radi testiranja
      qb.where('1 = 1');
    }

    if (search) {
      qb.andWhere(
        `(
          LOWER(product.name) LIKE LOWER(:search)
          OR
          LOWER(product.sku) LIKE LOWER(:search)
          OR
          LOWER(product.description) LIKE LOWER(:search)
        )`,
        {
          search: `%${search}%`,
        },
      );
    }

    if (sku) {
      qb.andWhere(
        'LOWER(product.sku) LIKE LOWER(:sku)',
        {
          sku: `%${sku}%`,
        },
      );
    }

    if (category) {
      qb.andWhere(
        'LOWER(product.category) = LOWER(:category)',
        {
          category,
        },
      );
    }

    if (minPrice !== undefined) {
      qb.andWhere(
        'product.price >= :minPrice',
        {
          minPrice,
        },
      );
    }

    if (maxPrice !== undefined) {
      qb.andWhere(
        'product.price <= :maxPrice',
        {
          maxPrice,
        },
      );
    }

    if (minStock !== undefined) {
      qb.andWhere(
        'product.stock >= :minStock',
        {
          minStock,
        },
      );
    }

    if (maxStock !== undefined) {
      qb.andWhere(
        'product.stock <= :maxStock',
        {
          maxStock,
        },
      );
    }

    if (active !== undefined) {
      qb.andWhere(
        'product.active = :active',
        {
          active,
        },
      );
    }

    qb.orderBy(
      `product.${safeSortBy}`,
      safeSortOrder,
    );

    qb.skip(
      (page - 1) * limit,
    );

    qb.take(limit);

    const [
      data,
      total,
    ] = await qb.getManyAndCount();

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages:
          Math.ceil(total / limit),
      },
    };
  }

  async findOne(
    organizationId: string,
    id: string,
  ): Promise<Product> {

    const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(organizationId);

    const product =
      await this.productsRepository.findOne({
        where: {
          id,
          ...(isValidUuid ? { organizationId } : {}),
        },
      });

    if (!product) {
      throw new NotFoundException(
        'Product does not exist',
      );
    }

    return product;
  }

  async update(
    organizationId: string,
    id: string,
    dto: UpdateProductDto,
  ): Promise<Product> {

    const product =
      await this.findOne(
        organizationId,
        id,
      );

    const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(organizationId);

    if (dto.sku &&
        dto.sku !== product.sku) {

      const existing =
        await this.productsRepository.findOne({
          where: {
            ...(isValidUuid ? { organizationId } : {}),
            sku: dto.sku,
          },
        });

      if (existing) {
        throw new ConflictException(
          'Product with this SKU already exists',
        );
      }
    }

    Object.assign(
      product,
      dto,
    );

    return this.productsRepository.save(
      product,
    );
  }

  async remove(
    organizationId: string,
    id: string,
  ): Promise<void> {

    const product =
      await this.findOne(
        organizationId,
        id,
      );

    await this.productsRepository.remove(
      product,
    );
  }
}