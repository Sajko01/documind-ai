import {
  Component,
  OnInit,
} from '@angular/core';

import {
  CommonModule,
} from '@angular/common';

import {
  UnansweredQuestionsService,
} from './unanswered-questions.service';

import {
  UnansweredQuestion,
} from './unanswered-questions.model';

@Component({
  selector: 'app-unanswered-questions',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './unanswered-questions.component.html',
  styleUrls: ['./unanswered-questions.component.scss'],
})
export class UnansweredQuestionsComponent implements OnInit {
  questions: UnansweredQuestion[] = [];
  loading = false;

  constructor(
    private readonly service: UnansweredQuestionsService,
  ) {}

  ngOnInit(): void {
    this.loadQuestions();
  }

  loadQuestions(): void {
    this.loading = true;

    this.service.getAll().subscribe({
      next: (questions) => {
        this.questions = questions;
        this.loading = false;
      },
      error: (error) => {
        console.error(
          'Failed to load unanswered questions',
          error,
        );
        this.loading = false;
      },
    });
  }
}