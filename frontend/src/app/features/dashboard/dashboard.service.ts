import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UnansweredQuestion } from '../unanswered-questions/unanswered-question.model';

export interface DashboardMetrics {
  totalUsers: number;
  totalDocuments: number;
  totalQuestions: number;
  totalProducts: number;
  unansweredQuestions: number;
}

export interface PopularQuestion {

  question: string;

  count: number;
}

export interface PopularDocument {

  documentId: string;

  filename: string;

  count: number;
}

export interface AiMetrics {

  averageResponseTime: number;

  averageRetrievalScore: number;
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  constructor(private http: HttpClient) {}

  getDashboard(): Observable<DashboardMetrics> {
    return this.http.get<DashboardMetrics>('/api/analytics/dashboard');
  }

  getAiMetrics():
  Observable<AiMetrics> {

  return this.http.get<AiMetrics>(
    '/api/analytics/ai',
  );
}

getPopularQuestions():
  Observable<PopularQuestion[]> {

  return this.http.get<PopularQuestion[]>(
    '/api/analytics/popular-questions',
  );
}

getPopularDocuments():
  Observable<PopularDocument[]> {

  return this.http.get<PopularDocument[]>(
    '/api/analytics/popular-documents',
  );
}
// Opciono: Za preuzimanje kompletne liste neodgovorenih pitanja
  getUnansweredQuestions(): Observable<UnansweredQuestion[]> {
    return this.http.get<UnansweredQuestion[]>('/api/unanswered-questions');
  }

}