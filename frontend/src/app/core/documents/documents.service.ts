import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  Document,
  DocumentListResponse,
} from './document.models';

@Injectable({
  providedIn: 'root',
})
export class DocumentsService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    'http://localhost:3000/api/documents';

  getDocuments(): Observable<DocumentListResponse> {
    return this.http.get<DocumentListResponse>(
      this.apiUrl,
    );
  }

  uploadDocument(
    file: File,
  ): Observable<unknown> {
    const formData = new FormData();

    formData.append(
      'file',
      file,
    );

    return this.http.post(
      `${this.apiUrl}/upload`,
      formData,
    );
  }

  deleteDocument(
    id: string,
  ): Observable<unknown> {
    return this.http.delete(
      `${this.apiUrl}/${id}`,
    );
  }
}