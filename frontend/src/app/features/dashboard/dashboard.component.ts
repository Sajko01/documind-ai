import { Component, OnInit, inject } from '@angular/core';
import { AsyncPipe, CommonModule, NgIf, DecimalPipe, PercentPipe } from '@angular/common'; // <-- Dodat PercentPipe
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { DashboardService, DashboardMetrics, AiMetrics, PopularQuestion, PopularDocument } from './dashboard.service';
import { MatCardModule } from '@angular/material/card';
import { FeedbackService } from '../feedback/services/feedback.service';
import { UnansweredQuestion } from '../unanswered-questions/unanswered-question.model';

export interface FeedbackStatistics {
  positivePercentage: number;
  negativePercentage: number;
  total: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [AsyncPipe, NgIf, MatCardModule, DecimalPipe, PercentPipe, CommonModule], // <-- Dodat PercentPipe u imports
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly dashboardService = inject(DashboardService);
  private readonly feadbackService = inject(FeedbackService);
  private readonly router = inject(Router);

  readonly user$ = this.authService.user$;

  popularDocuments: PopularDocument[] = [];
  metrics: DashboardMetrics | null = null;
  loading = false;
  error = '';
  popularQuestions: PopularQuestion[] = [];
  feedbackStatistics: FeedbackStatistics | null = null;
  aiMetrics: AiMetrics | null = null;
  unansweredQuestions: UnansweredQuestion[] = [];

  ngOnInit(): void {
    this.loadDashboard();
    this.loadAiMetrics();
    this.loadPopularQuestions();
    this.loadPopularDocuments();
    this.loadFeedbackStatistics();
    this.loadUnansweredQuestions();
  }

  loadDashboard(): void {
    this.loading = true;
    this.error = '';

    this.dashboardService.getDashboard().subscribe({
      next: (metrics) => {
        this.metrics = metrics;
        this.loading = false;
      },
      error: (error) => {
        console.error('Dashboard loading failed:', error);
        this.error = 'Neuspešno učitavanje analitike.';
        this.loading = false;
      },
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  loadAiMetrics(): void {
    this.dashboardService.getAiMetrics().subscribe({
      next: (metrics: any) => {
        this.aiMetrics = {
          averageResponseTime: Number(metrics?.averageResponseTime ?? 0),
          averageRetrievalScore: Number(metrics?.averageRetrievalScore ?? 0)
        };
      },
      error: (error) => {
        console.error('AI metrics failed:', error);
      },
    });
  }

  loadPopularQuestions(): void {
    this.dashboardService.getPopularQuestions().subscribe({
      next: questions => {
        this.popularQuestions = questions;
      },
      error: error => {
        console.error('Popular questions failed:', error);
      },
    });
  }

  loadPopularDocuments(): void {
    this.dashboardService.getPopularDocuments().subscribe({
      next: documents => {
        this.popularDocuments = documents;
      },
      error: error => {
        console.error('Popular documents failed:', error);
      },
    });
  }

  loadFeedbackStatistics(): void {
    this.feadbackService.getStatistics().subscribe({
      next: (stats) => {
        this.feedbackStatistics = stats;
      },
      error: (error) => {
        console.error('Feedback statistics failed:', error);
      },
    });
  }

  loadUnansweredQuestions(): void {
    this.dashboardService.getUnansweredQuestions().subscribe({
      next: questions => {
        this.unansweredQuestions = questions;
      },
      error: error => {
        console.error('Unanswered questions failed:', error);
      },
    });
  }
}