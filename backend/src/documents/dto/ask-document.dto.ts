import {
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class AskDocumentDto {

  @IsString()
  @IsNotEmpty()
  query!: string;
}