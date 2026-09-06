export type FeedbackRating =
  | 'POSITIVE'
  | 'NEGATIVE';


export interface CreateFeedbackRequest {

  messageId: string;

  rating: FeedbackRating;

  reason?: string;
}


export interface FeedbackResponse {

  success: boolean;

  feedback: {

    id: string;

    messageId: string;

    rating: FeedbackRating;

    reason: string | null;

    createdAt: string;

  };
}