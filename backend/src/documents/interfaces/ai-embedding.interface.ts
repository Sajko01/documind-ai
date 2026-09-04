export interface AiEmbeddingResponse {
  success: boolean;
  embedding: number[];
  dimensions: number;
  model: string;
}