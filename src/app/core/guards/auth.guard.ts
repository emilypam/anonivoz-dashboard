import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) return true;

  // Hay token pero venció → redirigir con motivo para mostrar mensaje
  if (auth.getToken()) {
    auth.clearSession();
    return router.createUrlTree(['/login'], { queryParams: { reason: 'expired' } });
  }

  return router.createUrlTree(['/login']);
};
