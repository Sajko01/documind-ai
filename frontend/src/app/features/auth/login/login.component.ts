import {
  Component,
  inject,
} from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import {
  Router,
} from '@angular/router';

import {
  AuthService,
} from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
  ],
  template: `
    <div class="auth-container">
      <h1>Login</h1>

      <form
        [formGroup]="loginForm"
        (ngSubmit)="login()"
      >
        <input
          type="email"
          placeholder="Email"
          formControlName="email"
        />

        <input
          type="password"
          placeholder="Password"
          formControlName="password"
        />

        <button
          type="submit"
          [disabled]="loginForm.invalid || loading"
        >
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>

        @if (errorMessage) {
          <p class="error">
            {{ errorMessage }}
          </p>
        }
      </form>
    </div>
  `,
})
export class LoginComponent {
  private readonly fb =
    inject(FormBuilder);

  private readonly authService =
    inject(AuthService);

  private readonly router =
    inject(Router);

  readonly loginForm =
    this.fb.nonNullable.group({
      email: [
        '',
        [
          Validators.required,
          Validators.email,
        ],
      ],

      password: [
        '',
        [
          Validators.required,
        ],
      ],
    });

  loading = false;
  errorMessage = '';

  login(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService
      .login(this.loginForm.getRawValue())
      .subscribe({
        next: () => {
          this.router.navigate([
            '/dashboard',
          ]);
        },

        error: (error) => {
          this.loading = false;

          this.errorMessage =
            error?.error?.error?.message ||
            'Login failed';
        },

        complete: () => {
          this.loading = false;
        },
      });
  }
}