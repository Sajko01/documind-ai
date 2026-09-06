import {
  Component,
  OnInit,
  inject,
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  DocumentsService,
  DocumentSummary,
} from '../../core/documents/documents.service';

import {
  Document,
} from '../../core/documents/document.models';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './documents.component.html',
  styleUrl: './documents.component.scss',
})
export class DocumentsComponent implements OnInit {
  private readonly documentsService = inject(DocumentsService);

  selectedSummary: DocumentSummary | null = null;
  summaryLoading = false;
  summaryError = '';
  selectedDocumentId: string | null = null;
  documents: Document[] = [];

  loading = false;
  uploading = false;
  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    this.loadDocuments();
  }

  loadDocuments(): void {
    this.loading = true;
    this.errorMessage = '';

    this.documentsService.getDocuments().subscribe({
      next: (response) => {
        this.documents = response.data;
      },
      error: (error) => {
        console.error('Failed to load documents', error);
        this.errorMessage = 'Failed to load documents.';
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    this.upload(file);
    input.value = '';
  }

  upload(file: File): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (file.type !== 'application/pdf') {
      this.errorMessage = 'Only PDF files are allowed.';
      return;
    }

    const maxSize = 10 * 1024 * 1024;

    if (file.size > maxSize) {
      this.errorMessage = 'Maximum file size is 10 MB.';
      return;
    }

    this.uploading = true;

    this.documentsService.uploadDocument(file).subscribe({
      next: () => {
        this.successMessage = 'Document uploaded successfully.';
        this.loadDocuments();
      },
      error: (error) => {
        console.error('Upload failed', error);
        this.errorMessage =
          error?.error?.error?.message ?? 'Failed to upload document.';
      },
      complete: () => {
        this.uploading = false;
      },
    });
  }

  generateSummary(documentId: string): void {
    this.summaryLoading = true;
    this.summaryError = '';
    this.selectedSummary = null;
    this.selectedDocumentId = documentId;

    this.documentsService.generateSummary(documentId).subscribe({
      next: (summary) => {
        this.selectedSummary = summary;
        this.summaryLoading = false;
      },
      error: (error) => {
        console.error('Summary generation failed:', error);
        this.summaryError = 'Failed to generate summary.';
        this.summaryLoading = false;
      },
    });
  }

  deleteDocument(document: Document): void {
    const confirmed = window.confirm(`Delete "${document.originalName}"?`);

    if (!confirmed) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    this.documentsService.deleteDocument(document.id).subscribe({
      next: () => {
        this.successMessage = 'Document deleted successfully.';
        this.loadDocuments();
      },
      error: (error) => {
        console.error('Delete failed', error);
        this.errorMessage =
          error?.error?.error?.message ?? 'Failed to delete document.';
      },
    });
  }

  formatFileSize(size: string): string {
    const bytes = Number(size);

    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}