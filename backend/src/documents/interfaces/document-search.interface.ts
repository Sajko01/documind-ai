export interface DocumentSearchResult {
  content: string;
  document: string;
  page: number;
  score: number;
}

export interface DocumentSearchResponse {
  query: string;
  results: DocumentSearchResult[];
}