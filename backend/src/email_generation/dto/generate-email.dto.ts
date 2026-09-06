import {
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class GenerateEmailDto {

  @IsIn([
    'sales',
    'support',
    'complaint',
    'offer',
    'follow-up',
  ])
  emailType!: string;

  @IsOptional()
  @IsString()
  recipientName?: string;

  @IsOptional()
  @IsString()
  recipientEmail?: string;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsString()
  @MaxLength(10000)
  context!: string;

  @IsOptional()
  @IsString()
  language?: string = 'en';

  @IsOptional()
  @IsString()
  tone?: string = 'professional';

  @IsOptional()
  @IsString()
  offerId?: string; // 👈 OVO JE FURALO 400 BAD REQUEST AKO JE FALILO
}