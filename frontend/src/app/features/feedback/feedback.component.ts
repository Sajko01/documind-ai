import { Component, OnInit, inject } from '@angular/core';
import { AsyncPipe, CommonModule, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { DashboardService, DashboardMetrics, AiMetrics, PopularQuestion, PopularDocument } from '../dashboard/dashboard.service';
import { MatCardModule } from '@angular/material/card';
import { DecimalPipe } from '@angular/common';
import { FeedbackService } from './services/feedback.service';
import { UnansweredQuestion } from '../unanswered-questions/unanswered-question.model';

export interface FeedbackStatistics {
  positivePercentage: number;
  negativePercentage: number;
  total: number;
}

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [AsyncPipe, NgIf, MatCardModule, DecimalPipe, CommonModule],
  templateUrl: '../dashboard/dashboard.component.html',
  styleUrls: ['../dashboard/dashboard.component.scss']
})
export class AnalyticsComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly dashboardService = inject(DashboardService);
  private readonly feedbackService = inject(FeedbackService);
  private readonly router = inject(Router);

  readonly user$ = this.authService.user$;

  unansweredQuestions: UnansweredQuestion[] = [];
  popularDocuments: PopularDocument[] = [];
  metrics: DashboardMetrics | null = null;
  dashboardData: any = null;
  loading = false;
  error = '';
  errorMessage = '';
  popularQuestions: PopularQuestion[] = [];
  feedbackStatistics: FeedbackStatistics | null = null;
  aiMetrics: AiMetrics | null = null;

  ngOnInit(): void {
    this.loadDashboard();
    this.loadAiMetrics();
    this.loadPopularQuestions();
    this.loadPopularDocuments();
    this.loadFeedbackStatistics();
  }

  loadDashboard(): void {
    this.loading = true;
    this.error = '';

    this.dashboardService.getDashboard().subscribe({
      next: (metrics) => {
        this.metrics = metrics;
        this.dashboardData = metrics;
        this.loading = false;
      },
      error: (error) => {
        console.error('Dashboard load failed:', error);
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
      error: (err) => {
        console.error('AI metrics load failed:', err);
      },
    });
  }

  loadPopularQuestions(): void {
    this.dashboardService.getPopularQuestions().subscribe({
      next: (questions) => {
        this.popularQuestions = questions;
      },
      error: (err) => {
        console.error('Popular questions load failed:', err);
      },
    });
  }

  loadPopularDocuments(): void {
    this.dashboardService.getPopularDocuments().subscribe({
      next: (documents) => {
        this.popularDocuments = documents;
      },
      error: (err) => {
        console.error('Popular documents load failed:', err);
      },
    });
  }

  loadFeedbackStatistics(): void {
    this.feedbackService.getStatistics().subscribe({
      next: (statistics) => {
        this.feedbackStatistics = statistics;
      },
      error: (error) => {
        console.error('Feedback statistics failed:', error);
      },
    });
  }
}