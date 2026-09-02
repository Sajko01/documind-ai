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
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
  ],
  template: `
    <div class="auth-container">
      <h1>Create account</h1>

      <form
        [formGroup]="registerForm"
        (ngSubmit)="register()"
      >
        <input
          type="text"
          placeholder="Organization name"
          formControlName="organizationName"
        />

        <input
          type="text"
          placeholder="Your name"
          formControlName="name"
        />

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
          [disabled]="
            registerForm.invalid || loading
          "
        >
          {{
            loading
              ? 'Creating account...'
              : 'Register'
          }}
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
export class RegisterComponent {
  private readonly fb =
    inject(FormBuilder);

  private readonly authService =
    inject(AuthService);

  private readonly router =
    inject(Router);

  readonly registerForm =
    this.fb.nonNullable.group({
      organizationName: [
        '',
        [
          Validators.required,
          Validators.maxLength(255),
        ],
      ],

      name: [
        '',
        [
          Validators.required,
          Validators.maxLength(255),
        ],
      ],

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
          Validators.minLength(8),
        ],
      ],
    });

  loading = false;
  errorMessage = '';

  register(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService
      .register(
        this.registerForm.getRawValue(),
      )
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
            'Registration failed';
        },

        complete: () => {
          this.loading = false;
        },
      });
  }
}