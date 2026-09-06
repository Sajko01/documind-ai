import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  ParseUUIDPipe,
  Body,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Chat')
@ApiBearerAuth()
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @ApiOperation({ summary: 'Kreiranje nove konverzacije' })
  @UseGuards(JwtAuthGuard)
  @Post('conversations')
  async createConversation(@CurrentUser() user: any) {
    const userId = user.userId || user.sub;

    return this.chatService.createConversation(
      user.organizationId,
      userId,
    );
  }

  @ApiOperation({ summary: 'Dohvatanje svih konverzacija organizacije' })
  @UseGuards(JwtAuthGuard)
  @Get('conversations')
  async getConversations(@CurrentUser() user: any) {
    return this.chatService.getConversations(
      user.organizationId,
    );
  }

  @ApiOperation({ summary: 'Dohvatanje pojedinačne konverzacije sa porukama' })
  @UseGuards(JwtAuthGuard)
  @Get('conversations/:id')
  async getConversation(
    @CurrentUser() user: any,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.chatService.getConversation(
      user.organizationId,
      id,
    );
  }

  @ApiOperation({ summary: 'Slanje poruke u chatu' })
  @UseGuards(JwtAuthGuard)
  @Post('message')
  async sendMessage(
    @CurrentUser() user: any,
    @Body() dto: SendMessageDto,
  ) {
    const userId = user.userId || user.sub;

    return this.chatService.sendMessage(
      user.organizationId,
      userId,
      dto,
    );
  }

  @ApiOperation({ summary: 'Interni endpoint za izvršavanje AI alata' })
  @Post('internal/tools/execute')
  async executeTool(
    @Body()
    body: {
      tool: string;
      args?: Record<string, any>;
      arguments?: Record<string, any>;
      organizationId: string;
      userId: string; // 👈 Dodali smo i userId u body pošto je ovo interni endpoint
    },
  ) {
    const toolArgs = body.args || body.arguments || {};

    console.log('--- INTERNI POZIV ALATA ---');
    console.log('Tool:', body.tool);
    console.log('OrganizationID:', body.organizationId);
    console.log('UserID:', body.userId);
    console.log('Args:', JSON.stringify(toolArgs));

    try {
      const result = await this.chatService.executeTool(
        body.organizationId, // 1. argument
        body.userId,         // 2. argument
        body.tool,           // 3. argument (ime alata)
        toolArgs,            // 4. argument (parsirani argumenti)
      );

      console.log('Rezultat izvršavanja:', JSON.stringify(result));
      return result;
    } catch (error) {
      console.error('Greška pri izvršavanju alata u ChatService:', error);
      throw error;
    }
  }
  

  @ApiOperation({ summary: 'Interni endpoint za RAG pretragu dokumenata' })
  @Post('internal/rag/search')
  async internalRagSearch(
    @Body()
    body: {
      query?: string;
      question?: string;
      prompt?: string;
      message?: string;
      search?: string;
      organizationId?: string;
      organization_id?: string;
      topK?: number;
      top_k?: number;
    },
  ) {
    // 1. Ekstrakcija teksta bez obzira kako ga FastAPI nazove
    const queryText =
      body.query ||
      body.question ||
      body.prompt ||
      body.message ||
      body.search ||
      '';

    // 2. Ekstrakcija organizationId (camelCase ili snake_case)
    const orgId = body.organizationId || body.organization_id || '';

    const limit = body.topK || body.top_k || 5;

    console.log('--- INTERNI POZIV RAG PRETRAGE ---');
    console.log('Query Text:', queryText);
    console.log('OrganizationID:', orgId);

    // 3. Provera da li su poslati obavezni parametri
    if (!queryText.trim()) {
      console.warn('⚠️ RAG pretraga odbijena: queryText je prazan ili undefined!');
      return { results: [] };
    }

    if (!orgId) {
      console.warn('⚠️ RAG pretraga odbijena: organizationId je prazan!');
      return { results: [] };
    }

    try {
      const results = await this.chatService.searchRag(
        orgId,
        queryText,
        limit,
      );
      return { results };
    } catch (error) {
      console.error('Greška pri RAG pretrazi:', error);
      throw error;
    }
  }

}