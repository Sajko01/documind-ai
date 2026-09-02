import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [AsyncPipe],
  template: `
    <div class="dashboard-container">
      @if (user$ | async; as user) {
        <header class="dashboard-header">
          <div>
            <h1>Dobrodošli, {{ user.name }}!</h1>
            <p>Rola: <strong>{{ user.role }}</strong> | Org ID: {{ user.organizationId }}</p>
          </div>
          <button (click)="logout()" class="logout-btn">Odjavi se</button>
        </header>

        <main class="dashboard-content">
          <div class="card">
            <h3>Korisnički profil</h3>
            <p><strong>Email:</strong> {{ user.email }}</p>
            <p><strong>ID:</strong> {{ user.id }}</p>
          </div>

          <div class="card">
            <h3>DocuMind Statstika</h3>
            <p>Uspešno ste ulogovani u sistem.</p>
          </div>
        </main>
      }
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
      font-family: sans-serif;
    }
    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #eee;
      padding-bottom: 1rem;
      margin-bottom: 2rem;
    }
    .logout-btn {
      padding: 0.5rem 1rem;
      background-color: #e53e3e;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .logout-btn:hover {
      background-color: #c53030;
    }
    .dashboard-content {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }
    .card {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }
  `]
})
export class DashboardComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // Preuzimanje user$ observable-a direktno iz AuthService-a
  readonly user$ = this.authService.user$;

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}