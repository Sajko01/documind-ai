import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendMessageDto {
  @ApiProperty({
    description: 'UUID konverzacije (opciono za novu konverzaciju)',
    example: 'ef24b632-8170-471c-a142-09ad7d70a83b',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  conversationId?: string;

  @ApiProperty({
    description: 'Poruka korisnika',
    example: 'Koliko košta CEM II?',
  })
  @IsString()
  @IsNotEmpty()
  message!: string;
}

export interface ChatSource {
  document: string;
  page?: number;
  score?: number;
}

export interface ChatResponse {
  conversationId: string;
  userMessage: {
    id: string;
    content: string;
  };
  assistantMessage: {
    id: string;
    content: string;
    sources: ChatSource[];
  };
}