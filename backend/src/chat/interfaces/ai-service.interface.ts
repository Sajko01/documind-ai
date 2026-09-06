// export interface AiSearchResult {
//   content: string;
//   document: string;
//   page: number;
//   score: number;
// }

// export interface AiSearchResponse {
//   results: AiSearchResult[];
// }

// export interface AiGenerationResponse {
//   success: boolean;
//   answer: string;
//   model: string;
// }

export interface AiSearchResult {
  document_id: string;
  filename: string;
  page: number;
  content: string;
  score: number;
}

export interface AiSearchResponse {
  results: AiSearchResult[];
}

// export interface AiGenerationResponse {
//   success: boolean;
//   answer: string;
//   model: string;
// }

export interface AiGenerationResponse {
  success: boolean;
  answer: string;
  model: string;
  sources: Array<{
    document: string;
    page: number;
    content?: string;
  }>;
  confidence: number;
  answered: boolean;
}

export interface SourceCitation {
  documentId: string;
  document: string;
  page: number;
  score: number;
}