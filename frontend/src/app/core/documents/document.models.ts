export type DocumentStatus =
  | 'UPLOADED'
  | 'PROCESSING'
  | 'READY'
  | 'FAILED';

export interface Document {
  id: string;
  organizationId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: string;
  status: DocumentStatus;
  createdAt: string;
}

export interface DocumentListResponse {
  success: boolean;
  data: Document[];
}