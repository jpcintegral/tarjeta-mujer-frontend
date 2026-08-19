import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthContext, AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const context = route.data['authContext'] as AuthContext | undefined;

  if (!context) {
    return true;
  }

  const expectedRole = getExpectedRole(context);

  const currentRole = authService.getUserRole(context);

  // ==========================================================
  // ROLE CORRECTO
  // ==========================================================

  if (currentRole === expectedRole) {
    return true;
  }

  // ==========================================================
  // ROLE INCORRECTO
  // ==========================================================

  authService.logout(context);

  if (context === 'WOMAN') {
    return router.createUrlTree(['/login']);
  }

  if (context === 'BUSINESS') {
    return router.createUrlTree(['/business/login']);
  }

  return router.createUrlTree(['/login']);
};

function getExpectedRole(context: AuthContext): string {
  switch (context) {
    case 'WOMAN':
      return 'woman';

    case 'BUSINESS':
      return 'business-owner';

    default:
      return '';
  }
}
