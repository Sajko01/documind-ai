import {
  Routes,
} from '@angular/router';

import {
  LoginComponent,
} from './features/auth/login/login.component';

import {
  RegisterComponent,
} from './features/auth/register/register.component';

import {
  authGuard,
} from './core/auth/auth.guard';

import { DocumentsComponent } from './features/documents/documents.component';

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
      import(
        './features/dashboard/dashboard.component'
      ).then(
        (m) => m.DashboardComponent,
      ),
  },
  {
  path: 'documents',
  component: DocumentsComponent,
  canActivate: [authGuard],
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