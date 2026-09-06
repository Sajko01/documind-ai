import {
  IsIn,
} from 'class-validator';


export class GenerateConversationSummaryDto {

  @IsIn([
    'en',
    'sr',
  ])
  language = 'en';
}