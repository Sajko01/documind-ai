import {
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';



import { ApiProperty } from '@nestjs/swagger';

export class CreateOrganizationDto {
  @ApiProperty({
    example: 'Acme Corporation',
    description: 'Organization name',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;
}