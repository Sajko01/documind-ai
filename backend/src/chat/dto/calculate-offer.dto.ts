import {
  IsInt,
  IsNumber,
  IsPositive,
  IsString,
} from 'class-validator';

export class CalculateOfferDto {

  @IsString()
  productId!: string;

  @IsInt()
  @IsPositive()
  quantity!: number;

  @IsNumber()
  @IsPositive()
  unitPrice!: number;
}