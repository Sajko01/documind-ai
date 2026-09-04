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

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  sources?: ChatSource[];
  toolResults?: ToolResult[];
  createdAt?: string;
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
  };
}