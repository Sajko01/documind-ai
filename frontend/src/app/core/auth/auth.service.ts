import {
  Injectable,
  inject,
} from '@angular/core';

import {
  HttpClient,
} from '@angular/common/http';

import {
  BehaviorSubject,
  Observable,
  tap,
} from 'rxjs';

import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
} from './auth.models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http =
    inject(HttpClient);

  private readonly apiUrl =
    'http://localhost:3000/api/auth';

  private readonly tokenKey =
    'documind_access_token';

  private readonly userSubject =
    new BehaviorSubject<User | null>(
      this.getStoredUser(),
    );

  readonly user$ =
    this.userSubject.asObservable();

  login(
    credentials: LoginRequest,
  ): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(
        `${this.apiUrl}/login`,
        credentials,
      )
      .pipe(
        tap((response) => {
          this.handleAuthResponse(response);
        }),
      );
  }

  register(
    data: RegisterRequest,
  ): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(
        `${this.apiUrl}/register`,
        data,
      )
      .pipe(
        tap((response) => {
          this.handleAuthResponse(response);
        }),
      );
  }

  logout(): void {
    localStorage.removeItem(
      this.tokenKey,
    );

    localStorage.removeItem(
      'documind_user',
    );

    this.userSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem(
      this.tokenKey,
    );
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): User | null {
    return this.userSubject.value;
  }

  private handleAuthResponse(
    response: AuthResponse,
  ): void {
    const {
      access_token,
      user,
    } = response.data;

    localStorage.setItem(
      this.tokenKey,
      access_token,
    );

    localStorage.setItem(
      'documind_user',
      JSON.stringify(user),
    );

    this.userSubject.next(user);
  }

  private getStoredUser(): User | null {
    const storedUser =
      localStorage.getItem(
        'documind_user',
      );

    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(
        storedUser,
      );
    } catch {
      return null;
    }
  }
}