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
  //
  // IMPORTANTE:
  //
  // El login obtiene un JWT NUEVO desde /auth/local
  // y posteriormente /users/me utiliza ese JWT
  // antes de guardarlo en localStorage.
  //
  // Si aquí obtenemos el token del localStorage,
  // podríamos reemplazar el JWT nuevo por uno vencido.
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

  if (!token) {
    return next(req);
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
      //
      // 403 NO CIERRA LA SESIÓN
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
// MANEJAR 401
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
