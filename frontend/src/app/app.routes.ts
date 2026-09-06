import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { MainLayoutComponent } from '../main-layout.component';// putanja do tvoje layout komponente
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  // Javne rute (bez sidebara)
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'register',
    component: RegisterComponent,
  },

  // Zaštićene rute koje dele zajednički Layout sa sidebar-om
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent,
          ),
      },
      {
        path: 'documents',
        loadComponent: () =>
          import('./features/documents/documents.component').then(
            (m) => m.DocumentsComponent,
          ),
      },
      {
        path: 'documents/:id/view',
        loadComponent: () =>
          import(
            './features/documents/document-viewer/document-viewer.component'
          ).then((m) => m.DocumentViewerComponent),
      },
      {
        path: 'chat',
        loadComponent: () =>
          import('./features/chat/chat.component').then(
            (m) => m.ChatComponent,
          ),
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./features/products/products.component').then(
            (m) => m.ProductsComponent,
          ),
      },
      {
        path: 'offers',
        loadComponent: () =>
          import('./features/offers/offers.component').then(
            (m) => m.OffersComponent,
          ),
      },
      {
        path: 'email',
        loadComponent: () =>
          import('./features/email/email.component').then(
            (m) => m.EmailComponent,
          ),
      },
      {
        path: 'unanswered-questions',
        loadComponent: () =>
          import(
            './features/unanswered-questions/unanswered-questions.component'
          ).then((m) => m.UnansweredQuestionsComponent),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },

  // Wildcard ruta
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];