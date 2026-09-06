import {
  Injectable,
} from '@angular/core';

import {
  HttpClient,
} from '@angular/common/http';

import {
  Observable,
} from 'rxjs';

import {
  CreateFeedbackRequest,
  FeedbackResponse,
} from '../models/feedback.model';

export interface FeedbackStatistics {

  total: number;

  positive: number;

  negative: number;

  positivePercentage: number;

  negativePercentage: number;
}


@Injectable({
  providedIn: 'root',
})
export class FeedbackService {

  private readonly apiUrl =
    '/api/feedback';


  constructor(
    private readonly http:
      HttpClient,
  ) {}


  createFeedback(
    request: CreateFeedbackRequest,
  ): Observable<FeedbackResponse> {

    return this.http.post<FeedbackResponse>(
      this.apiUrl,
      request,
    );

  }

  getStatistics():
  Observable<FeedbackStatistics> {

  return this.http.get<FeedbackStatistics>(
    '/api/feedback/statistics',
  );

}
}