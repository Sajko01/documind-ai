import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ChatService, ConversationSummary } from './chat.service';
import { ChatMessage, Conversation } from './chat.models';
import { FeedbackService } from '../feedback/services/feedback.service';
import { FeedbackRating } from '../feedback/models/feedback.model';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule,  MatIconModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  conversations: Conversation[] = [];
  messages: ChatMessage[] = [];
  selectedConversationId: string | null = null;
  messageText = '';
  loading = false;
  loadingConversations = false;
  isSendingMessage = false;
  errorMessage: string | null = null;

  isSummaryVisible = false;
  conversationSummary: ConversationSummary | null = null;
  conversationSummaryLoading = false;

  constructor(
    private readonly chatService: ChatService,
    private readonly router: Router,
    private readonly feedbackService: FeedbackService
  ) {}

  ngOnInit(): void {
    this.loadConversations();
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }

  loadConversations(): void {
    this.loadingConversations = true;
    
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

  selectConversation(conversationId: string): void {
    this.selectedConversationId = conversationId;
    
    this.conversationSummary = null;
    this.isSummaryVisible = false;

    this.loadConversation(conversationId);
  }

  loadConversation(conversationId: string): void {
    this.loading = true;
    this.chatService.getConversation(conversationId).subscribe({
      next: (conversation) => {
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
        this.conversationSummary = null;
        this.isSummaryVisible = false;
      },
    });
  }

  // sendMessage(): void {
  //   const message = this.messageText.trim();

  //   if (!message || this.loading) {
  //     return;
  //   }

  //   this.errorMessage = null;
  //   this.isSendingMessage = true;
  //   this.loading = true;

  //   const temporaryUserMessage: ChatMessage = {
  //     id: crypto.randomUUID(),
  //     role: 'user',
  //     content: message,
  //   };

  //   this.messages.push(temporaryUserMessage);
  //   this.messageText = '';
  //   this.scrollToBottom();

  //   this.chatService
  //     .sendMessage({
  //       conversationId: this.selectedConversationId ?? undefined,
  //       message,
  //     })
  //     .subscribe({
  //       next: (response) => {
  //         this.selectedConversationId = response.conversationId;

  //         const rawSources = response.assistantMessage.sources || [];
  //         const uniqueSources = rawSources.filter(
  //           (source: any, index: number, self: any[]) =>
  //             index ===
  //             self.findIndex(
  //               (s) =>
  //                 (s.documentId || s.id) === (source.documentId || source.id) &&
  //                 (s.page || 1) === (source.page || 1)
  //             )
  //         );

  //         const toolResults = response.assistantMessage.tool_results || [];

  //         this.messages.push({
  //           id: response.assistantMessage.id,
  //           role: 'assistant',
  //           content: response.assistantMessage.content,
  //           sources: uniqueSources,
  //           toolResults: toolResults,
  //         });

  //         this.loading = false;
  //         this.isSendingMessage = false;
  //         this.loadConversations();
  //         this.scrollToBottom();
  //       },
  //       error: () => {
  //         this.loading = false;
  //         this.isSendingMessage = false;
  //         this.errorMessage = 'Something went wrong. Please try again.';
  //       },
  //     });
  // }


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
  this.scrollToBottom();

  this.chatService
    .sendMessage({
      conversationId: this.selectedConversationId ?? undefined,
      message,
    })
    .subscribe({
      next: (response) => {


  this.selectedConversationId = response.conversationId;

  const rawSources = response.assistantMessage.sources || [];

  const uniqueSources = rawSources.filter(
    (source: any, index: number, self: any[]) =>
      index ===
      self.findIndex(
        (s) =>
          (s.documentId || s.id) ===
            (source.documentId || source.id) &&
          (s.page || 1) === (source.page || 1)
      )
  );

  const toolResults =
    response.assistantMessage.tool_results || [];



  const assistantMessage: ChatMessage = {
    id: response.assistantMessage.id,
    role: 'assistant',
    content: response.assistantMessage.content,
    sources: uniqueSources,
    toolResults: toolResults,
      metrics: response.metrics ?? null,
    //metrics: response.assistantMessage.metrics ?? null,
  };


  this.messages.push(assistantMessage);

  this.loading = false;
  this.isSendingMessage = false;

  this.loadConversations();
  this.scrollToBottom();
},

      error: () => {
        this.loading = false;
        this.isSendingMessage = false;
        this.errorMessage =
          'Something went wrong. Please try again.';
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

    this.conversationSummaryLoading = true;

    this.chatService
      .summarizeConversation(this.selectedConversationId)
      .subscribe({
        next: (summary) => {
          this.conversationSummary = summary;
          this.conversationSummaryLoading = false;
          this.isSummaryVisible = true;
        },
        error: (error) => {
          console.error('Conversation summary failed:', error);
          this.conversationSummaryLoading = false;
        },
      });
  }

  submitFeedback(message: ChatMessage, rating: FeedbackRating): void {
    if (message.feedbackRating) {
      return;
    }

    this.feedbackService
      .createFeedback({
        messageId: message.id,
        rating,
      })
      .subscribe({
        next: () => {
          message.feedbackRating = rating;
        },
        error: (error) => {
          console.error('Failed to submit feedback:', error);
        },
      });
  }
}