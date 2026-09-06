// export interface Conversation {
//   id: string;
//   organizationId: string;
//   userId: string;
//   title: string;
//   createdAt: string;
// }

// export interface ChatSource {
//   documentId: string;
//   document: string;
//   page: number;
//   score: number;
// }

// export interface ToolResult {
//   tool: string;
//   [key: string]: any;
// }

// export type MessageRole = 'user' | 'assistant';

// export interface ChatMessage {
//   id: string;
//   role: MessageRole;
//   content: string;
//   sources?: ChatSource[];
//   toolResults?: ToolResult[];
//   createdAt?: string;
//   feedbackRating?: FeedbackRating | null;

//   // 👉 DODAJ OVO DA UKLONIŠ TYPESCRIPT GREŠKU:
//   metrics?: {
//     totalTime: number | string;
//     embeddingTime?: number | string;
//     retrievalTime: number | string;
//     llmTime: number | string;
//   } | null;
// }

// export type FeedbackRating = 'POSITIVE' | 'NEGATIVE';

// export interface SendMessageRequest {
//   conversationId?: string;
//   message: string;
// }

// export interface ChatResponse {
//   conversationId: string;

//   userMessage: {
//     id: string;
//     content: string;
//   };

//   assistantMessage: {
//     id: string;
//     content: string;
//     sources: ChatSource[];
//     tool_results?: ToolResult[];
//   };
// }


export interface Conversation {
  id: string;
  organizationId: string;
  userId: string;
  title: string;
  createdAt: string;
}

export interface ChatSource {
  documentId: string;
  document: string;
  page: number;
  score: number;
}

export interface ToolResult {
  tool: string;
  [key: string]: any;
}

export type MessageRole = 'user' | 'assistant';

export type FeedbackRating = 'POSITIVE' | 'NEGATIVE';

export interface MessageMetrics {
  totalTime: number;
  embeddingTime: number;
  retrievalTime: number;
  llmTime: number;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;

  sources?: ChatSource[];

  toolResults?: ToolResult[];

  createdAt?: string;

  feedbackRating?: FeedbackRating | null;

  metrics?: MessageMetrics | null;
}

export interface SendMessageRequest {
  conversationId?: string;
  message: string;
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
    tool_results?: ToolResult[];

    // DODAJ OVO
    metrics?: MessageMetrics | null;
  };

  // I OVO
  metrics?: MessageMetrics | null;
}