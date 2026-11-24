import { Component, OnInit, inject, input } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ForoFacade } from '../facade/foro.facade';
import { AvisosService } from '../servicios/avisos.service';
import { mensajesError, noSoloEspacios } from '../validadores/validadores';

@Component({
  selector: 'app-nuevo-tema',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="row justify-content-center">
      <div class="col-12 col-lg-9 col-xl-8">
        <div class="card tarjeta-form shadow-sm">
          <div class="card-body p-4">
            <h1 class="h4 mb-3"><i class="bi bi-pencil-square me-2"></i>Publicar un tema</h1>
            <form [formGroup]="form" (ngSubmit)="publicar()" novalidate>
              <div class="row g-3">
                <div class="col-12 col-md-5">
                  <label for="categoria" class="form-label">Categoría</label>
                  <select id="categoria" class="form-select" formControlName="categoriaId"
                          [class.is-invalid]="errores('categoriaId').length">
                    <option value="">Selecciona una categoría</option>
                    @for (c of facade.categorias; track c.id) {
                      <option [value]="c.id">{{ c.nombre }}</option>
                    }
                  </select>
                  @for (m of errores('categoriaId'); track m) { <div class="invalid-feedback">{{ m }}</div> }
                </div>
                <div class="col-12 col-md-7">
                  <label for="titulo" class="form-label">Título</label>
                  <input id="titulo" class="form-control" formControlName="titulo"
                         placeholder="Resume tu pregunta en una frase" [class.is-invalid]="errores('titulo').length">
                  <div class="form-text">{{ form.controls.titulo.value.length }}/150 (mínimo 10)</div>
                  @for (m of errores('titulo'); track m) { <div class="invalid-feedback">{{ m }}</div> }
                </div>
                <div class="col-12">
                  <label for="contenido" class="form-label">Contenido</label>
                  <textarea id="contenido" rows="7" class="form-control" formControlName="contenido"
                            placeholder="Explica el detalle: qué intentaste, qué esperabas y qué pasó."
                            [class.is-invalid]="errores('contenido').length"></textarea>
                  <div class="form-text">{{ form.controls.contenido.value.length }}/4000 (mínimo 20)</div>
                  @for (m of errores('contenido'); track m) { <div class="invalid-feedback">{{ m }}</div> }
                </div>
              </div>
              <div class="alert alert-light border small mt-3 mb-0">
                <i class="bi bi-info-circle me-1"></i>Recuerda las normas: sin spam, sin ofensas y en la categoría correcta.
                Los temas que no las cumplan pueden ser baneados por un administrador.
              </div>
              <div class="d-flex flex-column flex-sm-row gap-2 mt-3">
                <button class="btn btn-primario" type="submit">Publicar</button>
                <a class="btn btn-outline-secondary" routerLink="/temas">Cancelar</a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class NuevoTemaPage implements OnInit {
  readonly facade = inject(ForoFacade);
  private readonly avisos = inject(AvisosService);
  private readonly router = inject(Router);

  /** ?categoria= preseleccionada desde el listado. */
  readonly categoria = input<string | undefined>();

  readonly form = inject(FormBuilder).nonNullable.group({
    categoriaId: ['', [Validators.required]],
    titulo: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(150), noSoloEspacios()]],
    contenido: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(4000), noSoloEspacios()]],
  });

  ngOnInit(): void {
    const id = Number(this.categoria());
    if (this.facade.categoria(id)) this.form.controls.categoriaId.setValue(String(id));
  }

  errores(campo: string): string[] {
    return mensajesError(this.form.get(campo));
  }

  publicar(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const r = this.facade.publicarTema({ ...v, categoriaId: Number(v.categoriaId) });
    this.avisos.resultado(r);
    if (r.ok && r.id) this.router.navigate(['/temas', r.id]);
  }
}
