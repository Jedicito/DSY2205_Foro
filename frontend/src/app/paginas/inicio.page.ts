import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ForoFacade } from '../facade/foro.facade';

@Component({
  selector: 'app-inicio',
  imports: [RouterLink, DatePipe],
  template: `
    <section class="hero rounded-4 p-4 p-md-5 mb-4 text-white">
      <div class="row align-items-center g-4">
        <div class="col-12 col-md-7 col-lg-8">
          <h1 class="display-6 fw-bold">La comunidad tech que responde</h1>
          <p class="lead mb-3">Pregunta, comparte y aprende sobre programación, redes, IA, hardware y más.</p>
          <form class="d-flex flex-column flex-sm-row gap-2" role="search" (submit)="buscar($event, q.value)">
            <input #q class="form-control form-control-lg" type="search" placeholder="Buscar temas..."
                   aria-label="Buscar temas" maxlength="60">
            <button class="btn btn-light btn-lg" type="submit"><i class="bi bi-search me-1"></i>Buscar</button>
          </form>
        </div>
        <div class="col-12 col-md-5 col-lg-4">
          <div class="row g-2 text-center">
            <div class="col-4 col-md-12 col-xl-4"><div class="estadistica"><strong>{{ facade.temasVisibles().length }}</strong><span>temas</span></div></div>
            <div class="col-4 col-md-12 col-xl-4"><div class="estadistica"><strong>{{ facade.categorias.length }}</strong><span>categorías</span></div></div>
            <div class="col-4 col-md-12 col-xl-4"><div class="estadistica"><strong>{{ totalUsuarios() }}</strong><span>miembros</span></div></div>
          </div>
        </div>
      </div>
    </section>

    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2 class="h4 mb-0">Categorías</h2>
      @if (facade.autenticado()) {
        <a class="btn btn-primario btn-sm" routerLink="/temas/nuevo"><i class="bi bi-plus-lg me-1"></i>Nuevo tema</a>
      }
    </div>
    <div class="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-3 mb-5">
      @for (c of facade.categorias; track c.id) {
        <div class="col">
          <a class="card tarjeta-categoria h-100 text-decoration-none" [routerLink]="['/temas']" [queryParams]="{ categoria: c.id }">
            <div class="card-body d-flex gap-3">
              <div class="icono-categoria"><i class="bi {{ c.icono }}"></i></div>
              <div>
                <h3 class="h6 mb-1">{{ c.nombre }}</h3>
                <p class="small text-muted mb-2">{{ c.descripcion }}</p>
                <span class="badge text-bg-light border">{{ facade.cantidadTemasPorCategoria(c.id) }} temas</span>
                <span class="badge badge-area ms-1">{{ c.area }}</span>
              </div>
            </div>
          </a>
        </div>
      }
    </div>

    <div class="row g-4">
      <div class="col-12 col-lg-8">
        <h2 class="h4">Temas recientes</h2>
        <div class="list-group shadow-sm">
          @for (t of recientes(); track t.id) {
            <a class="list-group-item list-group-item-action py-3" [routerLink]="['/temas', t.id]">
              <div class="d-flex flex-column flex-md-row justify-content-between gap-1">
                <strong>{{ t.titulo }}</strong>
                <small class="text-muted text-nowrap">{{ t.fechaCreacion | date:'dd/MM/yyyy HH:mm' }}</small>
              </div>
              <small class="text-muted">
                <span class="badge badge-area me-1">{{ t.categoria }}</span>
                por &#64;{{ t.autor }} · <i class="bi bi-chat-dots"></i> {{ t.cantidadComentarios }}
              </small>
            </a>
          }
        </div>
        <a class="btn btn-link px-0 mt-2" routerLink="/temas">Ver todos los temas <i class="bi bi-arrow-right"></i></a>
      </div>
      <div class="col-12 col-lg-4">
        <h2 class="h4">Más comentados</h2>
        <ol class="list-group list-group-numbered shadow-sm">
          @for (t of facade.masComentados(); track t.id) {
            <li class="list-group-item d-flex justify-content-between align-items-start">
              <a class="ms-2 me-auto" [routerLink]="['/temas', t.id]">{{ t.titulo }}</a>
              <span class="badge text-bg-primary rounded-pill">{{ t.cantidadComentarios }}</span>
            </li>
          }
        </ol>
        @if (!facade.autenticado()) {
          <div class="card mt-4 border-0 tarjeta-invitacion">
            <div class="card-body">
              <h3 class="h6">¿Quieres participar?</h3>
              <p class="small mb-2">Crea una cuenta gratis para publicar temas y comentar.</p>
              <a class="btn btn-primario btn-sm" routerLink="/registro">Crear cuenta</a>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class InicioPage {
  readonly facade = inject(ForoFacade);
  private readonly router = inject(Router);

  readonly recientes = computed(() => this.facade.temasVisibles().slice(0, 5));
  readonly totalUsuarios = computed(() => this.facade.usuarios().filter(u => u.activo).length);

  buscar(evento: Event, texto: string): void {
    evento.preventDefault();
    this.router.navigate(['/temas'], { queryParams: { q: texto.trim() || null } });
  }
}
