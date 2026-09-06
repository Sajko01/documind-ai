import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ChatService, ConversationSummary } from './chat.service';
import { ChatMessage, Conversation } from './chat.models';
import { FeedbackService } from '../feedback/services/feedback.service';
import { FeedbackRating } from '../feedback/models/feedback.model';

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


  summary: any = null;
isSummaryVisible: boolean = false;

  conversationSummary:
  ConversationSummary | null = null;

conversationSummaryLoading =
  false;

  constructor(
    private readonly chatService: ChatService,
    private readonly router: Router,

  private readonly feedbackService:
    FeedbackService,
  ) {}

  ngOnInit(): void {
    this.loadConversations();
  }

  // loadConversations(): void {
  //   this.loadingConversations = true;
  //   this.chatService.getConversations().subscribe({
  //     next: (conversations) => {
  //       this.conversations = conversations;
  //       this.loadingConversations = false;
  //     },
  //     error: () => {
  //       this.loadingConversations = false;
  //     },
  //   });
  // }
  // 1. Definiši ove promenljive na vrhu klase (kod ostalih propertija)


  // 2. Usklađena metoda za učitavanje konverzacija
  loadConversations(): void {
    this.loadingConversations = true;
    
    // Očisti rezime i zatvori prozor za sumiranje
    this.conversationSummary = null;
    this.isSummaryVisible = false;

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

  // 3. Usklađena metoda za izbor konverzacije
  selectConversation(conversationId: string): void {
    this.selectedConversationId = conversationId;
    
    // Očisti rezime i sakrij prozor čim korisnik pređe na drugi čet
    this.conversationSummary = null;
    this.isSummaryVisible = false;

    this.loadConversation(conversationId);
  }

  // loadConversations(): void {
  //   this.loadingConversations = true;
    
  //   // OVDE STAVI TAČAN NAZIV PROMENLJIVE KOJU KORISTIŠ ZA REZIME, npr:
  //   this.conversationSummary = null; 
  //   // ili: this.summary = null;
  //   // ili ako imaš boolean za prikaz: this.isSummaryVisible = false;

  //   this.chatService.getConversations().subscribe({
  //     next: (conversations) => {
  //       this.conversations = conversations;
  //       this.loadingConversations = false;
  //     },
  //     error: () => {
  //       this.loadingConversations = false;
  //     },
  //   });
  // }

  // // selectConversation(conversationId: string): void {
  // //   this.selectedConversationId = conversationId;
  // //   this.loadConversation(conversationId);
  // // }

  // selectConversation(conversationId: string): void {
  //   this.selectedConversationId = conversationId;
    
  //   // Očisti rezime kada korisnik pređe na drugi čet
  //   this.summary = null; // ili this.conversationSummary = null;
  //   this.isSummaryVisible = false; // ako koristiš i boolean za prikaz

  //   this.loadConversation(conversationId);
  // }

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


  summarizeConversation(): void {

  if (!this.selectedConversationId) {
    return;
  }

  this.conversationSummaryLoading =
    true;

  this.chatService
    .summarizeConversation(
      this.selectedConversationId,
    )
    .subscribe({

      next: summary => {

        this.conversationSummary =
          summary;

        this.conversationSummaryLoading =
          false;
      },

      error: error => {

        console.error(
          'Conversation summary failed:',
          error,
        );

        this.conversationSummaryLoading =
          false;
      },
    });
}

submitFeedback(
  message: ChatMessage,
  rating: FeedbackRating,
): void {

  if (
    message.feedbackRating
  ) {

    return;

  }


  this.feedbackService
    .createFeedback({

      messageId:
        message.id,

      rating,

    })
    .subscribe({

      next: () => {

        message.feedbackRating =
          rating;

      },

      error: error => {

        console.error(
          'Failed to submit feedback:',
          error,
        );

      },

    });

}
}