// import {
//   HttpInterceptorFn,
// } from '@angular/common/http';

// import {
//   inject,
// } from '@angular/core';

// import {
//   Router,
// } from '@angular/router';

// import {
//   catchError,
//   throwError,
// } from 'rxjs';

// import {
//   AuthService,
// } from './auth.service';

// export const authInterceptor:
//   HttpInterceptorFn = (
//     req,
//     next,
//   ) => {
//     const authService =
//       inject(AuthService);

//     const router =
//       inject(Router);

//     const token =
//       authService.getToken();

//     const authRequest = token
//       ? req.clone({
//           setHeaders: {
//             Authorization:
//               `Bearer ${token}`,
//           },
//         })
//       : req;

//     return next(authRequest).pipe(
//       catchError((error) => {
//         if (
//           error.status === 401
//         ) {
//           authService.logout();

//           router.navigate([
//             '/login',
//           ]);
//         }

//         return throwError(
//           () => error,
//         );
//       }),
//     );
//   };

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getToken();

  // Dodajemo Bearer token u zaglavlje ako postoji
  const authRequest = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      })
    : req;

  // Proveravamo da li je zahtev upućen na login ili register endpointe
  const isAuthEndpoint =
    req.url.includes('/auth/login') ||
    req.url.includes('/auth/register');

  return next(authRequest).pipe(
    catchError((error) => {
      // Reagujemo na 401 samo ako greška NIJE sa login/register rute
      if (error.status === 401 && !isAuthEndpoint) {
        authService.logout();
        router.navigate(['/login']);
      }

      return throwError(() => error);
    })
  );
};