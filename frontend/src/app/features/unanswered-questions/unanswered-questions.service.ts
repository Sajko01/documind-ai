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
  UnansweredQuestion,
} from './unanswered-question.model';


@Injectable({
  providedIn: 'root',
})
export class UnansweredQuestionsService {

  private readonly apiUrl =
    '/api/unanswered-questions';


  constructor(
    private readonly http:
      HttpClient,
  ) {}


  getAll():
    Observable<UnansweredQuestion[]> {

    return this.http.get<
      UnansweredQuestion[]
    >(this.apiUrl);

  }

  
}