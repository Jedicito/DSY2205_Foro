import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-sin-permiso',
  imports: [RouterLink],
  template: `
    <div class="text-center py-5">
      <i class="bi bi-lock display-4 text-danger"></i>
      <h1 class="h4 mt-3">No tienes permiso para ver esta página</h1>
      <p class="text-muted">Esta sección es solo para administradores.</p>
      <a class="btn btn-primario" routerLink="/">Volver al inicio</a>
    </div>
  `,
})
export class SinPermisoPage {}

@Component({
  selector: 'app-no-encontrada',
  imports: [RouterLink],
  template: `
    <div class="text-center py-5">
      <div class="display-3 fw-bold texto-marca">404</div>
      <h1 class="h4">Página no encontrada</h1>
      <a class="btn btn-primario mt-2" routerLink="/">Volver al inicio</a>
    </div>
  `,
})
export class NoEncontradaPage {}
