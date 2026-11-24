import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ForoFacade } from '../facade/foro.facade';

/** Solo usuarios con sesión iniciada (cualquier rol). */
export const autenticadoGuard: CanActivateFn = (_ruta, estado) => {
  const facade = inject(ForoFacade);
  return facade.autenticado()
    ? true
    : inject(Router).createUrlTree(['/login'], { queryParams: { volver: estado.url } });
};

/** Solo administradores. */
export const adminGuard: CanActivateFn = () => {
  const facade = inject(ForoFacade);
  const router = inject(Router);
  if (!facade.autenticado()) return router.createUrlTree(['/login']);
  return facade.esAdmin() ? true : router.createUrlTree(['/sin-permiso']);
};

/** Login, registro y recuperar contraseña: solo sin sesión. */
export const invitadoGuard: CanActivateFn = () => {
  const facade = inject(ForoFacade);
  return facade.autenticado() ? inject(Router).createUrlTree(['/']) : true;
};
