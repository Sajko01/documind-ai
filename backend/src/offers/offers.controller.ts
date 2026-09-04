import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards, // 👈 1. Uvezen UseGuards
} from '@nestjs/common';

import {
  OffersService,
} from './offers.service';

import {
  CreateOfferDto,
} from './dto/create-offer.dto';

import {
  CurrentUser,
} from '../auth/decorators/current-user.decorator';

import {
  JwtAuthGuard,
} from '../auth/guards/jwt-auth.guard'; // 👈 2. Uvezen tvoj JwtAuthGuard (proveri putanju ako se razlikuje)
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Offers') // 👈 Grupisanje u Swagger-u
@ApiBearerAuth()   // 👈 OVO PALI KATANAC ZA SVE RUTE U OVOM KONTROLERU!
@Controller('offers')
@UseGuards(JwtAuthGuard) // 👈 3. Primenjen gardijan na ceo kontroler
export class OffersController {

  constructor(
    private readonly offersService: OffersService,
  ) {}

  @Post()
  async create(
    @CurrentUser() user: any, // 👈 Korišćen tvoj dekorator umesto @Req()
    @Body() createOfferDto: CreateOfferDto,
  ) {
    console.log('USER IZ REQUESTA:', user);
    
    const organizationId = user?.organizationId;
    
    if (!organizationId) {
      throw new BadRequestException('Organization ID is missing from user session');
    }

    return this.offersService.create(organizationId, createOfferDto);
  }

  @Get()
  async findAll(
    @CurrentUser() user: any,
  ) {
    return this.offersService.findAll(
      user.organizationId,
    );
  }

  @Get(':id')
  async findOne(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.offersService.findOne(
      user.organizationId,
      id,
    );
  }

  @Put(':id')
  async update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: Partial<CreateOfferDto>,
  ) {
    return this.offersService.update(
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
    return this.offersService.remove(
      user.organizationId,
      id,
    );
  }
}