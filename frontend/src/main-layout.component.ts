import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-layout" [class.collapsed]="isCollapsed">
      <!-- Sidebar Navigacija -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <div class="sidebar-brand" *ngIf="!isCollapsed">DocuMind AI</div>
          <button class="toggle-btn" (click)="toggleSidebar()" [title]="isCollapsed ? 'Proširi meni' : 'Skupi meni'">
            <!-- Čist, stabilan SVG sa rotacijom preko klase -->
            <svg class="collapse-icon" [class.rotated]="isCollapsed" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <path d="M9 3v18"></path>
              <path d="m14 9-3 3 3 3"></path>
            </svg>
          </button>
        </div>

        <nav class="sidebar-nav">
          <!-- 1. Pregled / Početna -->
          <a routerLink="/dashboard" routerLinkActive="active" title="Dashboard">
            <span class="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>
            </span>
            <span class="label" *ngIf="!isCollapsed">Dashboard</span>
          </a>

          <!-- 2. Glavni izvor znanja (Baza) -->
          <a routerLink="/documents" routerLinkActive="active" title="Documents">
            <span class="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            </span>
            <span class="label" *ngIf="!isCollapsed">Documents</span>
          </a>

          <!-- 3. Glavna interakcija (AI Chat) -->
          <a routerLink="/chat" routerLinkActive="active" title="Chat">
            <span class="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            </span>
            <span class="label" *ngIf="!isCollapsed">Chat</span>
          </a>

          <!-- 4. Poslovni podaci (Proizvodi i Ponude) -->
          <a routerLink="/products" routerLinkActive="active" title="Products">
            <span class="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
            </span>
            <span class="label" *ngIf="!isCollapsed">Products</span>
          </a>
          
          <a routerLink="/offers" routerLinkActive="active" title="Offers">
            <span class="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
            </span>
            <span class="label" *ngIf="!isCollapsed">Offers</span>
          </a>

          <!-- 5. Komunikacija sa klijentima -->
          <a routerLink="/email" routerLinkActive="active" title="Email">
            <span class="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            </span>
            <span class="label" *ngIf="!isCollapsed">Email</span>
          </a>

          <!-- 6. Održavanje / Unapređenje sistema -->
          <a routerLink="/unanswered-questions" routerLinkActive="active" title="Neodgovoreni">
            <span class="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            </span>
            <span class="label" *ngIf="!isCollapsed">Neodgovoreni</span>
          </a>
        </nav>
      </aside>

      <!-- Glavni desni kontejner -->
      <div class="main-container">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent {
  isCollapsed = false;

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
  }
}