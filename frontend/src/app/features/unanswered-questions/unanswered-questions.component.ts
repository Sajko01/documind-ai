import {
  Component,
  OnInit,
} from '@angular/core';

import {
  CommonModule,
} from '@angular/common';

import {
  MatTableModule,
} from '@angular/material/table';

import {
  MatCardModule,
} from '@angular/material/card';

import {
  UnansweredQuestionsService,
} from './unanswered-questions.service';

import {
  UnansweredQuestion,
} from './unanswered-question.model';


@Component({

  selector:
    'app-unanswered-questions',

  standalone: true,

  imports: [

    CommonModule,

    MatTableModule,

    MatCardModule,

  ],

  templateUrl:
    './unanswered-questions.component.html',

})
export class UnansweredQuestionsComponent
  implements OnInit {

  questions:
    UnansweredQuestion[] = [];


  loading = false;


  displayedColumns = [

    'question',

    'confidence',

    'status',

    'createdAt',

  ];


  constructor(
    private readonly service:
      UnansweredQuestionsService,
  ) {}


  ngOnInit(): void {

    this.loadQuestions();

  }


  loadQuestions(): void {

    this.loading = true;


    this.service
      .getAll()
      .subscribe({

        next: questions => {

          this.questions =
            questions;

          this.loading = false;

        },

        error: error => {

          console.error(
            'Failed to load unanswered questions',
            error,
          );

          this.loading = false;

        },

      });

  }
}