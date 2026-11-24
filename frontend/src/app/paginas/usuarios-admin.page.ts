import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ForoFacade } from '../facade/foro.facade';
import { Rol } from '../modelos/modelos';
import { AvisosService } from '../servicios/avisos.service';

/** Gestión de usuarios (solo ADMIN): habilitar/deshabilitar y cambiar rol. Equivale a ms-usuarios. */
@Component({
  selector: 'app-usuarios-admin',
  imports: [DatePipe],
  template: `
    <div class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-3">
      <h1 class="h4 mb-0"><i class="bi bi-people me-2"></i>Usuarios</h1>
      <input class="form-control w-auto" type="search" placeholder="Filtrar por nombre o correo" maxlength="60"
             aria-label="Filtrar usuarios" (input)="filtro.set($any($event.target).value)">
    </div>
    <div class="table-responsive card shadow-sm">
      <table class="table align-middle mb-0">
        <thead class="table-light">
          <tr><th>Usuario</th><th class="d-none d-md-table-cell">Correo</th><th class="d-none d-lg-table-cell">Registro</th><th>Rol</th><th>Estado</th><th class="text-end">Acciones</th></tr>
        </thead>
        <tbody>
          @for (u of lista(); track u.id) {
            <tr [class.table-secondary]="!u.activo">
              <td><strong>&#64;{{ u.nombreUsuario }}</strong><div class="small text-muted">{{ u.nombreCompleto }}</div></td>
              <td class="d-none d-md-table-cell">{{ u.email }}</td>
              <td class="d-none d-lg-table-cell">{{ u.fechaRegistro | date:'dd/MM/yyyy' }}</td>
              <td>
                <select class="form-select form-select-sm" [value]="u.rol" [disabled]="u.id === facade.sesion()?.id"
                        [attr.aria-label]="'Rol de ' + u.nombreUsuario"
                        (change)="cambiarRol(u.id, $any($event.target).value)">
                  <option value="USUARIO">USUARIO</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </td>
              <td><span class="badge" [class.text-bg-success]="u.activo" [class.text-bg-secondary]="!u.activo">{{ u.activo ? 'Activo' : 'Deshabilitado' }}</span></td>
              <td class="text-end">
                @if (u.id !== facade.sesion()?.id) {
                  <button class="btn btn-sm text-nowrap" type="button" [class.btn-outline-danger]="u.activo" [class.btn-outline-success]="!u.activo"
                          (click)="avisos.resultado(facade.cambiarEstadoUsuario(u.id, !u.activo))">
                    {{ u.activo ? 'Deshabilitar' : 'Habilitar' }}
                  </button>
                } @else { <small class="text-muted">Tu cuenta</small> }
              </td>
            </tr>
          } @empty { <tr><td colspan="6" class="text-center text-muted">Sin resultados.</td></tr> }
        </tbody>
      </table>
    </div>
  `,
})
export class UsuariosAdminPage {
  readonly facade = inject(ForoFacade);
  readonly avisos = inject(AvisosService);
  readonly filtro = signal('');

  readonly lista = computed(() => {
    const f = this.filtro().trim().toLowerCase();
    return this.facade.usuarios().filter(u =>
      !f || u.nombreUsuario.includes(f) || u.email.includes(f) || u.nombreCompleto.toLowerCase().includes(f));
  });

  cambiarRol(id: number, rol: Rol): void {
    this.avisos.resultado(this.facade.cambiarRolUsuario(id, rol));
  }
}
