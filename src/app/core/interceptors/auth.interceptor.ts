import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, EMPTY } from 'rxjs';

import { AuthContext, AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // ============================================================
  // NO AGREGAR JWT A AUTENTICACIÓN
  // ============================================================

  const isAuthRequest =
    req.url.includes('/auth/local') || req.url.includes('/auth/local/register');

  if (isAuthRequest) {
    return next(req);
  }

  // ============================================================
  // RESPETAR AUTHORIZATION EXPLÍCITO
  // ============================================================

  if (req.headers.has('Authorization')) {
    return next(req);
  }

  // ============================================================
  // DETERMINAR CONTEXTO POR RUTA
  // ============================================================

  const context = getAuthContext(router.url);

  // ============================================================
  // PETICIÓN PÚBLICA
  // ============================================================

  if (!context) {
    return next(req);
  }

  // ============================================================
  // OBTENER TOKEN DEL CONTEXTO
  // ============================================================

  const token = authService.getToken(context);

  // ============================================================
  // NO HAY SESIÓN
  // ============================================================

  if (!token) {
    handleUnauthorized(context, authService, router);

    return EMPTY;
  }

  // ============================================================
  // AGREGAR JWT
  // ============================================================

  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  // ============================================================
  // EJECUTAR PETICIÓN
  // ============================================================

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // ========================================================
      // TOKEN / SESIÓN NO VÁLIDA
      // ========================================================

      if (error.status === 401) {
        handleUnauthorized(context, authService, router);

        return EMPTY;
      }

      // ========================================================
      // CUALQUIER OTRO ERROR
      // ========================================================

      throw error;
    }),
  );
};

// ============================================================
// CONTEXTO SEGÚN RUTA
// ============================================================

function getAuthContext(url: string): AuthContext | null {
  const cleanUrl = url.split('?')[0];

  if (cleanUrl === '/mujer' || cleanUrl.startsWith('/mujer/')) {
    return 'WOMAN';
  }

  if (cleanUrl === '/business' || cleanUrl.startsWith('/business/')) {
    return 'BUSINESS';
  }

  return null;
}

// ============================================================
// MANEJAR 401 / SESIÓN INVÁLIDA
// ============================================================

function handleUnauthorized(
  context: AuthContext,
  authService: AuthService,
  router: Router,
): void {
  // ==========================================================
  // CERRAR SESIÓN DEL CONTEXTO CORRESPONDIENTE
  // ==========================================================

  authService.logout(context);

  // ==========================================================
  // REDIRECCIÓN AL LOGIN CORRESPONDIENTE
  // ==========================================================

  if (context === 'WOMAN') {
    router.navigate(['/login']);

    return;
  }

  if (context === 'BUSINESS') {
    router.navigate(['/business/login']);

    return;
  }
}
