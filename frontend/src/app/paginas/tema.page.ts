import { DatePipe } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ForoFacade } from '../facade/foro.facade';
import { AvisosService } from '../servicios/avisos.service';
import { mensajesError, noSoloEspacios } from '../validadores/validadores';

/** Detalle de un tema con sus comentarios. USUARIO comenta y elimina lo suyo; ADMIN además banea. */
@Component({
  selector: 'app-tema',
  imports: [RouterLink, DatePipe, ReactiveFormsModule],
  template: `
    @if (tema(); as t) {
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb small">
          <li class="breadcrumb-item"><a routerLink="/">Inicio</a></li>
          <li class="breadcrumb-item"><a routerLink="/temas" [queryParams]="{ categoria: t.categoriaId }">{{ t.categoria }}</a></li>
          <li class="breadcrumb-item active text-truncate" aria-current="page">{{ t.titulo }}</li>
        </ol>
      </nav>

      <div class="row g-4">
        <div class="col-12 col-lg-8">
          <article class="card shadow-sm mb-4">
            <div class="card-body p-4">
              <span class="badge badge-area mb-2">{{ t.categoria }}</span>
              <h1 class="h3">{{ t.titulo }}</h1>
              <p class="small text-muted">Publicado por <strong>&#64;{{ t.autor }}</strong> el {{ t.fechaCreacion | date:"dd/MM/yyyy 'a las' HH:mm" }}</p>
              <p class="contenido-tema">{{ t.contenido }}</p>
              <div class="d-flex flex-wrap gap-2">
                @if (facade.puedeEliminar(t.autorId)) {
                  <button class="btn btn-sm btn-outline-danger" type="button" (click)="eliminarTema()">
                    <i class="bi bi-trash me-1"></i>Eliminar tema
                  </button>
                }
                @if (facade.esAdmin()) {
                  <button class="btn btn-sm btn-danger" type="button" (click)="banearTema()">
                    <i class="bi bi-slash-circle me-1"></i>Banear tema
                  </button>
                }
              </div>
            </div>
          </article>

          <h2 class="h5 mb-3"><i class="bi bi-chat-dots me-2"></i>{{ comentarios().length }} comentario(s)</h2>
          @for (c of comentarios(); track c.id) {
            <div class="card mb-2 comentario">
              <div class="card-body py-2 px-3">
                <div class="d-flex justify-content-between align-items-start gap-2">
                  <small class="text-muted"><strong>&#64;{{ c.autor }}</strong> · {{ c.fechaCreacion | date:'dd/MM/yyyy HH:mm' }}</small>
                  <div class="btn-group btn-group-sm">
                    @if (facade.puedeEliminar(c.autorId)) {
                      <button class="btn btn-outline-secondary" type="button" title="Eliminar" aria-label="Eliminar comentario"
                              (click)="avisos.resultado(facade.eliminarComentario(c.id))"><i class="bi bi-trash"></i></button>
                    }
                    @if (facade.esAdmin()) {
                      <button class="btn btn-outline-danger" type="button" title="Banear" aria-label="Banear comentario"
                              (click)="avisos.resultado(facade.banearComentario(c.id))"><i class="bi bi-slash-circle"></i></button>
                    }
                  </div>
                </div>
                <p class="mb-1 mt-1">{{ c.contenido }}</p>
              </div>
            </div>
          } @empty {
            <p class="text-muted">Nadie ha comentado todavía. ¡Sé el primero!</p>
          }

          @if (facade.autenticado()) {
            <form class="card shadow-sm mt-3" [formGroup]="form" (ngSubmit)="comentar()" novalidate>
              <div class="card-body">
                <label for="comentario" class="form-label fw-semibold">Escribe un comentario</label>
                <textarea id="comentario" rows="3" class="form-control" formControlName="contenido"
                          [class.is-invalid]="errores().length"></textarea>
                <div class="form-text">{{ form.controls.contenido.value.length }}/2000</div>
                @for (m of errores(); track m) { <div class="invalid-feedback">{{ m }}</div> }
                <button class="btn btn-primario mt-2" type="submit"><i class="bi bi-send me-1"></i>Comentar</button>
              </div>
            </form>
          } @else {
            <div class="alert alert-light border mt-3">
              <a routerLink="/login" [queryParams]="{ volver: '/temas/' + t.id }">Inicia sesión</a> para comentar.
            </div>
          }
        </div>

        <aside class="col-12 col-lg-4">
          <div class="card shadow-sm">
            <div class="card-body">
              <h2 class="h6">Más en {{ t.categoria }}</h2>
              <ul class="list-unstyled small mb-0">
                @for (o of relacionados(); track o.id) {
                  <li class="mb-2"><a [routerLink]="['/temas', o.id]">{{ o.titulo }}</a></li>
                } @empty {
                  <li class="text-muted">No hay otros temas en esta categoría.</li>
                }
              </ul>
            </div>
          </div>
        </aside>
      </div>
    } @else {
      <div class="text-center py-5">
        <i class="bi bi-question-circle display-4 text-muted"></i>
        <h1 class="h4 mt-3">El tema no existe o ya no está disponible</h1>
        <a class="btn btn-primario mt-2" routerLink="/temas">Ver temas</a>
      </div>
    }
  `,
})
export class TemaPage {
  readonly facade = inject(ForoFacade);
  readonly avisos = inject(AvisosService);
  private readonly router = inject(Router);

  /** Parámetro :id de la ruta. */
  readonly id = input.required<string>();

  readonly tema = computed(() => this.facade.tema(Number(this.id())));
  readonly comentarios = computed(() => this.facade.comentariosDe(Number(this.id())));
  readonly relacionados = computed(() => {
    const t = this.tema();
    return t ? this.facade.buscarTemas('', t.categoriaId).filter(o => o.id !== t.id).slice(0, 5) : [];
  });

  readonly form = inject(FormBuilder).nonNullable.group({
    contenido: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(2000), noSoloEspacios()]],
  });

  errores(): string[] {
    return mensajesError(this.form.controls.contenido);
  }

  comentar(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const r = this.facade.comentar(Number(this.id()), this.form.controls.contenido.value);
    this.avisos.resultado(r);
    if (r.ok) this.form.reset();
  }

  eliminarTema(): void {
    const r = this.facade.eliminarTema(Number(this.id()));
    this.avisos.resultado(r);
    if (r.ok) this.router.navigateByUrl('/temas');
  }

  banearTema(): void {
    const r = this.facade.banearTema(Number(this.id()));
    this.avisos.resultado(r);
    if (r.ok) this.router.navigateByUrl('/admin/moderacion');
  }
}
