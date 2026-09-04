import {
  IsEmail,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

import {
  Type,
} from 'class-transformer';

export class CreateOfferItemDto {

  @IsUUID()
  productId!: string;

  @IsInt()
  @IsPositive()
  quantity!: number;
}

export class CreateOfferDto {

  @IsString()
  customerName!: string;

  @IsOptional()
  @IsEmail()
  customerEmail?: string;

  @ValidateNested({
    each: true,
  })
  @Type(() => CreateOfferItemDto)
  items!: CreateOfferItemDto[];
}