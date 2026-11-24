import { DatePipe, SlicePipe } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ForoFacade } from '../facade/foro.facade';

/** Listado de temas con búsqueda por palabra clave y filtro por categoría (query params ?q=&categoria=). */
@Component({
  selector: 'app-temas',
  imports: [RouterLink, DatePipe, SlicePipe],
  template: `
    <nav aria-label="breadcrumb">
      <ol class="breadcrumb small">
        <li class="breadcrumb-item"><a routerLink="/">Inicio</a></li>
        <li class="breadcrumb-item active" aria-current="page">{{ categoriaActual()?.nombre ?? 'Todos los temas' }}</li>
      </ol>
    </nav>

    <div class="row g-4">
      <aside class="col-12 col-md-4 col-lg-3">
        <div class="card shadow-sm">
          <div class="card-body">
            <label for="buscar" class="form-label fw-semibold">Buscar</label>
            <input id="buscar" type="search" class="form-control mb-3" placeholder="Palabra clave..." maxlength="60"
                   [value]="q() ?? ''" (input)="filtrar({ q: $any($event.target).value })">
            <h2 class="h6">Categorías</h2>
            <div class="list-group list-group-flush">
              <button type="button" class="list-group-item list-group-item-action px-2"
                      [class.active]="!categoriaId()" (click)="filtrar({ categoria: null })">Todas</button>
              @for (c of facade.categorias; track c.id) {
                <button type="button" class="list-group-item list-group-item-action px-2 d-flex justify-content-between"
                        [class.active]="categoriaId() === c.id" (click)="filtrar({ categoria: c.id })">
                  <span><i class="bi {{ c.icono }} me-2"></i>{{ c.nombre }}</span>
                  <span class="badge text-bg-light">{{ facade.cantidadTemasPorCategoria(c.id) }}</span>
                </button>
              }
            </div>
          </div>
        </div>
      </aside>

      <section class="col-12 col-md-8 col-lg-9">
        <div class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-3">
          <div>
            <h1 class="h4 mb-0">{{ categoriaActual()?.nombre ?? 'Todos los temas' }}</h1>
            @if (categoriaActual(); as c) { <p class="text-muted small mb-0">{{ c.descripcion }}</p> }
          </div>
          @if (facade.autenticado()) {
            <a class="btn btn-primario" routerLink="/temas/nuevo" [queryParams]="{ categoria: categoriaId() }">
              <i class="bi bi-plus-lg me-1"></i>Nuevo tema
            </a>
          } @else {
            <a class="btn btn-outline-primario" routerLink="/login">Inicia sesión para publicar</a>
          }
        </div>

        @if (q()) {
          <p class="small text-muted">{{ resultados().length }} resultado(s) para "<strong>{{ q() }}</strong>"</p>
        }

        <div class="row row-cols-1 row-cols-lg-2 g-3">
          @for (t of resultados(); track t.id) {
            <div class="col">
              <div class="card tarjeta-tema h-100 shadow-sm">
                <div class="card-body">
                  <span class="badge badge-area mb-2">{{ t.categoria }}</span>
                  <h2 class="h6"><a class="stretched-link text-decoration-none" [routerLink]="['/temas', t.id]">{{ t.titulo }}</a></h2>
                  <p class="small text-muted mb-0">{{ t.contenido | slice:0:110 }}{{ t.contenido.length > 110 ? '...' : '' }}</p>
                </div>
                <div class="card-footer bg-transparent small text-muted d-flex justify-content-between">
                  <span>&#64;{{ t.autor }} · {{ t.fechaCreacion | date:'dd/MM/yyyy' }}</span>
                  <span><i class="bi bi-chat-dots"></i> {{ t.cantidadComentarios }}</span>
                </div>
              </div>
            </div>
          } @empty {
            <div class="col-12">
              <div class="alert alert-light border text-center">
                <i class="bi bi-inbox fs-3 d-block mb-1"></i>No hay temas que coincidan.
              </div>
            </div>
          }
        </div>
      </section>
    </div>
  `,
})
export class TemasPage {
  readonly facade = inject(ForoFacade);
  private readonly router = inject(Router);

  // Query params enlazados como inputs (withComponentInputBinding)
  readonly q = input<string | undefined>();
  readonly categoria = input<string | undefined>();

  readonly categoriaId = computed(() => {
    const id = Number(this.categoria());
    return Number.isInteger(id) && id > 0 ? id : undefined;
  });

  readonly categoriaActual = computed(() => {
    const id = this.categoriaId();
    return id ? this.facade.categoria(id) : undefined;
  });

  readonly resultados = computed(() => this.facade.buscarTemas(this.q() ?? '', this.categoriaId()));

  filtrar(cambios: { q?: string | null; categoria?: number | null }): void {
    const q = cambios.q !== undefined ? (cambios.q?.trim() || null) : undefined;
    this.router.navigate(['/temas'], {
      queryParams: { ...(q !== undefined ? { q } : {}), ...('categoria' in cambios ? { categoria: cambios.categoria } : {}) },
      queryParamsHandling: 'merge',
    });
  }
}
