export type UnansweredQuestionStatus =
  | 'OPEN'
  | 'REVIEWED'
  | 'RESOLVED';


export interface UnansweredQuestion {

  id: string;

  organizationId: string;

  userId: string;

  conversationId: string | null;

  messageId: string | null;

  question: string;

  confidence: number | null;

  status: UnansweredQuestionStatus;

  createdAt: string;
}