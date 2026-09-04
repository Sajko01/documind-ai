import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsInt,
  IsPositive,
  Min,
  MaxLength,
} from 'class-validator';

export class CreateProductDto {

  @IsString()
  @MaxLength(100)
  sku!: string;

  @IsString()
  @MaxLength(255)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsInt()
  @Min(0)
  stock!: number;

  @IsString()
  @MaxLength(50)
  unit!: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}