
export interface AiProcessedPage {
  page_number: number;
  text: string;
}


export interface AiProcessedChunk {
  document_id: string;
  page_number: number;
  chunk_index: number;
  content: string;
  token_count: number;
  embedding: number[];
}


export interface AiProcessingResponse {
  success: boolean;
  document_id: string;
  status: 'READY';
  page_count: number;
  text: string;
  pages: AiProcessedPage[];
  chunks: AiProcessedChunk[];
}