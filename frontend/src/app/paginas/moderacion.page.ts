import { DatePipe, SlicePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ForoFacade } from '../facade/foro.facade';
import { AvisosService } from '../servicios/avisos.service';

/** Panel de moderación (solo ADMIN): banear y restaurar temas y comentarios. Equivale a ms-moderacion. */
@Component({
  selector: 'app-moderacion',
  imports: [DatePipe, SlicePipe, RouterLink],
  template: `
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3">
      <h1 class="h4 mb-0"><i class="bi bi-shield-check me-2"></i>Moderación</h1>
      <a class="btn btn-outline-primario btn-sm" routerLink="/admin/usuarios"><i class="bi bi-people me-1"></i>Gestionar usuarios</a>
    </div>

    <div class="row row-cols-2 row-cols-md-4 g-3 mb-4">
      <div class="col"><div class="card resumen text-center"><div class="card-body"><strong>{{ facade.resumenModeracion().temasActivos }}</strong><span>Temas activos</span></div></div></div>
      <div class="col"><div class="card resumen resumen-alerta text-center"><div class="card-body"><strong>{{ facade.resumenModeracion().temasBaneados }}</strong><span>Temas baneados</span></div></div></div>
      <div class="col"><div class="card resumen text-center"><div class="card-body"><strong>{{ facade.resumenModeracion().comentariosActivos }}</strong><span>Comentarios activos</span></div></div></div>
      <div class="col"><div class="card resumen resumen-alerta text-center"><div class="card-body"><strong>{{ facade.resumenModeracion().comentariosBaneados }}</strong><span>Comentarios baneados</span></div></div></div>
    </div>

    <ul class="nav nav-pills mb-3 flex-column flex-sm-row gap-1" role="tablist">
      <li class="nav-item"><button class="nav-link" type="button" [class.active]="pestana() === 'temas'" (click)="pestana.set('temas')">Temas activos</button></li>
      <li class="nav-item"><button class="nav-link" type="button" [class.active]="pestana() === 'comentarios'" (click)="pestana.set('comentarios')">Comentarios activos</button></li>
      <li class="nav-item"><button class="nav-link" type="button" [class.active]="pestana() === 'baneados'" (click)="pestana.set('baneados')">Baneados</button></li>
    </ul>

    @switch (pestana()) {
      @case ('temas') {
        <div class="table-responsive card shadow-sm">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light"><tr><th>Título</th><th class="d-none d-md-table-cell">Categoría</th><th class="d-none d-sm-table-cell">Autor</th><th class="text-end">Acción</th></tr></thead>
            <tbody>
              @for (t of facade.temasPorEstado('ACTIVO'); track t.id) {
                <tr>
                  <td><a [routerLink]="['/temas', t.id]">{{ t.titulo }}</a></td>
                  <td class="d-none d-md-table-cell">{{ t.categoria }}</td>
                  <td class="d-none d-sm-table-cell">&#64;{{ t.autor }}</td>
                  <td class="text-end"><button class="btn btn-sm btn-danger" type="button" (click)="avisos.resultado(facade.banearTema(t.id))"><i class="bi bi-slash-circle me-1"></i>Banear</button></td>
                </tr>
              } @empty { <tr><td colspan="4" class="text-muted text-center">No hay temas activos.</td></tr> }
            </tbody>
          </table>
        </div>
      }
      @case ('comentarios') {
        <div class="table-responsive card shadow-sm">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light"><tr><th>Comentario</th><th class="d-none d-md-table-cell">Tema</th><th class="d-none d-sm-table-cell">Autor</th><th class="text-end">Acción</th></tr></thead>
            <tbody>
              @for (c of facade.comentariosPorEstado('ACTIVO'); track c.id) {
                <tr>
                  <td>{{ c.contenido | slice:0:70 }}{{ c.contenido.length > 70 ? '...' : '' }}</td>
                  <td class="d-none d-md-table-cell small">{{ c.temaTitulo }}</td>
                  <td class="d-none d-sm-table-cell">&#64;{{ c.autor }}</td>
                  <td class="text-end"><button class="btn btn-sm btn-danger" type="button" (click)="avisos.resultado(facade.banearComentario(c.id))"><i class="bi bi-slash-circle me-1"></i>Banear</button></td>
                </tr>
              } @empty { <tr><td colspan="4" class="text-muted text-center">No hay comentarios activos.</td></tr> }
            </tbody>
          </table>
        </div>
      }
      @case ('baneados') {
        <div class="row g-3">
          <div class="col-12 col-lg-6">
            <h2 class="h6">Temas baneados</h2>
            <ul class="list-group shadow-sm">
              @for (t of facade.temasPorEstado('BANEADO'); track t.id) {
                <li class="list-group-item d-flex justify-content-between align-items-center gap-2">
                  <div><div>{{ t.titulo }}</div><small class="text-muted">&#64;{{ t.autor }} · {{ t.fechaCreacion | date:'dd/MM/yyyy' }}</small></div>
                  <button class="btn btn-sm btn-outline-success text-nowrap" type="button" (click)="avisos.resultado(facade.restaurarTema(t.id))"><i class="bi bi-arrow-counterclockwise me-1"></i>Restaurar</button>
                </li>
              } @empty { <li class="list-group-item text-muted">Sin temas baneados.</li> }
            </ul>
          </div>
          <div class="col-12 col-lg-6">
            <h2 class="h6">Comentarios baneados</h2>
            <ul class="list-group shadow-sm">
              @for (c of facade.comentariosPorEstado('BANEADO'); track c.id) {
                <li class="list-group-item d-flex justify-content-between align-items-center gap-2">
                  <div><div>{{ c.contenido | slice:0:60 }}</div><small class="text-muted">&#64;{{ c.autor }} en "{{ c.temaTitulo }}"</small></div>
                  <button class="btn btn-sm btn-outline-success text-nowrap" type="button" (click)="avisos.resultado(facade.restaurarComentario(c.id))"><i class="bi bi-arrow-counterclockwise me-1"></i>Restaurar</button>
                </li>
              } @empty { <li class="list-group-item text-muted">Sin comentarios baneados.</li> }
            </ul>
          </div>
        </div>
      }
    }
  `,
})
export class ModeracionPage {
  readonly facade = inject(ForoFacade);
  readonly avisos = inject(AvisosService);
  readonly pestana = signal<'temas' | 'comentarios' | 'baneados'>('temas');
}
