import { IsOptional, IsIn } from 'class-validator';

export class GenerateDocumentSummaryDto {
  @IsOptional()
  @IsIn([
    'en',
    'sr',
  ])
  language?: string = 'en';
}