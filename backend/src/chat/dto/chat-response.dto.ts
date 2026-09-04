export interface ChatSource {
  documentId: string;
  document: string;
  page: number;
  score: number;
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