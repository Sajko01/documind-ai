import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateDocumentDto {
  @ApiProperty({
    example: 'Godišnji finansijski izveštaj 2026',
    description: 'Naslov dokumenta',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  @ApiProperty({
    example: 'Sadržaj dokumenta i detaljne analize...',
    description: 'Tekstualni sadržaj dokumenta (opciono)',
    required: false,
  })
  @IsString()
  @IsOptional()
  content?: string;
}