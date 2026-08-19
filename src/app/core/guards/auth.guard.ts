import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthContext, AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const context = route.data['authContext'] as AuthContext | undefined;

  // Si la ruta no define contexto, no aplicar este guard.
  if (!context) {
    return true;
  }

  if (authService.isAuthenticated(context)) {
    return true;
  }

  // ==========================================================
  // LOGIN CORRESPONDIENTE
  // ==========================================================

  if (context === 'WOMAN') {
    return router.createUrlTree(['/login']);
  }

  if (context === 'BUSINESS') {
    return router.createUrlTree(['/business/login']);
  }

  return router.createUrlTree(['/login']);
};
