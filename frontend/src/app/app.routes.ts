import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent,
      ),
  },
  {
    path: 'documents',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/documents/documents.component').then(
        (m) => m.DocumentsComponent,
      ),
  },
  {
    path: 'documents/:id/view',
    canActivate: [authGuard], // 👈 Obavezno zaštiti i pojedinačni pregled
    loadComponent: () =>
      import(
        './features/documents/document-viewer/document-viewer.component'
      ).then((m) => m.DocumentViewerComponent),
  },
  {
    path: 'chat',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/chat/chat.component').then(
        (m) => m.ChatComponent,
      ),
  },
  {
    path: 'products',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/products/products.component').then(
        (m) => m.ProductsComponent,
      ),
  },
  {
  path: 'offers',
  canActivate: [authGuard],
  loadComponent: () =>
    import(
      './features/offers/offers.component'
    ).then(
      m => m.OffersComponent
    ),
  },
  {
  path: 'email',
    canActivate: [authGuard],
  loadComponent: () =>
    import(
      './features/email/email.component'
    ).then(
      m => m.EmailComponent,
    ),
  },
  {
  path: 'unanswered-questions',
    canActivate: [authGuard],
  loadComponent: () =>
    import(
      './features/unanswered-questions/unanswered-questions.component'
    ).then(
      m => m.UnansweredQuestionsComponent
    ),
 },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];