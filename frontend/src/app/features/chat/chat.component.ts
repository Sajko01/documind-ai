import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ChatService } from './chat.service';
import { ChatMessage, Conversation } from './chat.models';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit {
  conversations: Conversation[] = [];
  messages: ChatMessage[] = [];
  selectedConversationId: string | null = null;
  messageText = '';
  loading = false;
  loadingConversations = false;
  isSendingMessage = false;
  errorMessage: string | null = null;

  constructor(
    private readonly chatService: ChatService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadConversations();
  }

  loadConversations(): void {
    this.loadingConversations = true;
    this.chatService.getConversations().subscribe({
      next: (conversations) => {
        this.conversations = conversations;
        this.loadingConversations = false;
      },
      error: () => {
        this.loadingConversations = false;
      },
    });
  }

  selectConversation(conversationId: string): void {
    this.selectedConversationId = conversationId;
    this.loadConversation(conversationId);
  }

  loadConversation(conversationId: string): void {
    this.loading = true;
    this.chatService.getConversation(conversationId).subscribe({
      next: (conversation) => {
        // Mapiramo poruke i obezbeđujemo podršku za toolResults / tool_results
        this.messages = (conversation.messages || []).map((msg: any) => ({
          ...msg,
          toolResults: msg.toolResults || msg.tool_results || [],
        }));
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  newConversation(): void {
    this.chatService.createConversation().subscribe({
      next: (conversation) => {
        this.conversations.unshift(conversation);
        this.selectedConversationId = conversation.id;
        this.messages = [];
      },
    });
  }

  sendMessage(): void {
    const message = this.messageText.trim();

    if (!message || this.loading) {
      return;
    }

    this.errorMessage = null;
    this.isSendingMessage = true;
    this.loading = true;

    const temporaryUserMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: message,
    };

    this.messages.push(temporaryUserMessage);
    this.messageText = '';

    this.chatService
      .sendMessage({
        conversationId: this.selectedConversationId ?? undefined,
        message,
      })
      .subscribe({
        next: (response) => {
          this.selectedConversationId = response.conversationId;

          // DEDUPLIKACIJA IZVORA
          const rawSources = response.assistantMessage.sources || [];
          const uniqueSources = rawSources.filter(
            (source: any, index: number, self: any[]) =>
              index ===
              self.findIndex(
                (s) =>
                  (s.documentId || s.id) === (source.documentId || source.id) &&
                  (s.page || 1) === (source.page || 1)
              )
          );

          // Prihvatanje tool_results iz odgovora
          const toolResults = response.assistantMessage.tool_results || [];

          this.messages.push({
            id: response.assistantMessage.id,
            role: 'assistant',
            content: response.assistantMessage.content,
            sources: uniqueSources,
            toolResults: toolResults,
          });

          this.loading = false;
          this.isSendingMessage = false;
          this.loadConversations();
        },
        error: () => {
          this.loading = false;
          this.isSendingMessage = false;
          this.errorMessage = 'Something went wrong. Please try again.';
        },
      });
  }

  openDocument(documentId: string, page: number): void {
    if (!documentId) return;

    this.router.navigate(['/documents', documentId, 'view'], {
      queryParams: { page },
    });
  }
}