import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  Document,
  DocumentListResponse,
} from './document.models';

// Definišemo DocumentSummary za Korak 19
export interface DocumentSummary {
  summary: string;
  key_points: string[];
  products: string[];
  prices: string[];
  important_conditions: string[];
}

@Injectable({
  providedIn: 'root',
})
export class DocumentsService {
  private readonly http = inject(HttpClient);

  // Centralizovan URL
  private readonly apiUrl = 'http://localhost:3000/api/documents';

  /**
   * Dobavljanje svih dokumenata (vraća objekat sa data: Document[])
   */
  getDocuments(): Observable<{ data: Document[] }> {
    return this.http.get<{ data: Document[] }>(this.apiUrl);
  }

  /**
   * Otpremanje dokumenta
   */
  uploadDocument(file: File): Observable<unknown> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(
      `${this.apiUrl}/upload`,
      formData,
    );
  }

  /**
   * Brisanje dokumenta po ID-ju
   */
  deleteDocument(id: string): Observable<unknown> {
    return this.http.delete(
      `${this.apiUrl}/${id}`,
    );
  }

  /**
   * KORAK 19 — Generisanje sumiranja dokumenta
   */
  generateSummary(
    documentId: string,
  ): Observable<DocumentSummary> {
    return this.http.post<DocumentSummary>(
      `${this.apiUrl}/${documentId}/summary`,
      {
        language: 'en',
      },
    );
  }
}