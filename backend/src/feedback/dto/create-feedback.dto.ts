import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

import {
  FeedbackRating,
} from '../enums/feedback-rating.enum';


export class CreateFeedbackDto {

  @IsUUID()
  messageId!: string;


  @IsEnum(FeedbackRating)
  rating!: FeedbackRating;


  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}