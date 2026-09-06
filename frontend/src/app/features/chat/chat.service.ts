import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  ChatResponse,
  Conversation,
  SendMessageRequest,
} from './chat.models';

export interface SourceInfo {
  document: string;
  page: number;
  documentId?: string;
}

export interface ConversationSummary {
  summary: string;
  key_points: string[];
  decisions: string[];
  action_items: string[];
  sources: SourceInfo[];
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private readonly apiUrl = 'http://localhost:3000/api/chat';

  constructor(private readonly http: HttpClient) {}

  getConversations(): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(`${this.apiUrl}/conversations`);
  }

  getConversation(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/conversations/${id}`);
  }

  createConversation(): Observable<Conversation> {
    return this.http.post<Conversation>(`${this.apiUrl}/conversations`, {});
  }

  sendMessage(request: SendMessageRequest): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(`${this.apiUrl}/message`, request).pipe(
      map((response) => {
        let updatedAssistant = { ...response.assistantMessage };

        // Deduplikacija RAG izvora
        if (response?.assistantMessage?.sources?.length) {
          const rawSources = response.assistantMessage.sources;

          const uniqueSources = rawSources.filter(
            (source, index, self) =>
              index ===
              self.findIndex(
                (s) => s.documentId === source.documentId && s.page === source.page
              )
          );

          updatedAssistant.sources = uniqueSources;
        }

        return {
          ...response,
          assistantMessage: updatedAssistant,
        };
      })
    );
  }

  summarizeConversation(conversationId: string): Observable<ConversationSummary> {
    // Ispravljeno: Uklonjen je višak /chat iz putanje pošto backend čeka na /api/documents/...
    return this.http.post<ConversationSummary>(`http://localhost:3000/api/documents/conversations/${conversationId}/summary`, {});
  }
}