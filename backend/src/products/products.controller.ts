import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';

@ApiTags('products')
@ApiBearerAuth() // 👈 Dodaje katanac i Authorization header u Swagger UI za sve rute
@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  async create(
    @CurrentUser() user: any,
    @Body() dto: CreateProductDto,
  ) {
    return this.productsService.create(
      user.organizationId,
      dto,
    );
  }

  @Get()
  async findAll(
    @CurrentUser() user: any,
    @Query() query: ProductQueryDto,
  ) {
    return this.productsService.findAll(
      user.organizationId,
      query,
    );
  }

  @Get(':id')
  async findOne(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.productsService.findOne(
      user.organizationId,
      id,
    );
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(
      user.organizationId,
      id,
      dto,
    );
  }

  @Delete(':id')
  async remove(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    await this.productsService.remove(
      user.organizationId,
      id,
    );

    return {
      success: true,
    };
  }
}