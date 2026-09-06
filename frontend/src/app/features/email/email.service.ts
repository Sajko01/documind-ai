import {
  Injectable,
} from '@angular/core';

import {
  HttpClient,
} from '@angular/common/http';

import {
  Observable,
} from 'rxjs';

export type EmailType =
  | 'sales'
  | 'support'
  | 'complaint'
  | 'offer'
  | 'follow-up';

export interface GenerateEmailRequest {
  emailType: EmailType;
  recipientName?: string;
  recipientEmail?: string;
  subject?: string;
  offerId?: string; // <-- Umesto samo ručnog konteksta, šaljemo ID ponude
  context?: string;  // Može ostati opciono ako zatreba i ručni unos
  language?: string;
  tone?: string;
}

export interface GenerateEmailResponse {

  subject: string;

  body: string;

  email_type: EmailType;
}

@Injectable({
  providedIn: 'root',
})
export class EmailService {

    private readonly apiUrl = 'http://localhost:3000/api/ai/generate-email';

  constructor(
    private readonly http: HttpClient,
  ) {}

  generateEmail(
    data: GenerateEmailRequest,
  ): Observable<GenerateEmailResponse> {

    return this.http.post<GenerateEmailResponse>(
      this.apiUrl,
      data,
    );
  }
}