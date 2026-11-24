import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ForoFacade } from '../facade/foro.facade';
import { AvisosService } from '../servicios/avisos.service';
import { camposIguales, mensajesError, noSoloEspacios, passwordSegura } from '../validadores/validadores';
import { ReglasPassword } from './reglas-password';

@Component({
  selector: 'app-perfil',
  imports: [ReactiveFormsModule, RouterLink, DatePipe, ReglasPassword],
  template: `
    @if (facade.sesion(); as u) {
      <div class="row g-4">
        <div class="col-12 col-lg-4">
          <div class="card shadow-sm h-100">
            <div class="card-body text-center">
              <div class="avatar mx-auto mb-2">{{ u.nombreCompleto.charAt(0) }}</div>
              <h1 class="h5 mb-0">{{ u.nombreCompleto }}</h1>
              <div class="text-muted">&#64;{{ u.nombreUsuario }}</div>
              <span class="badge mt-2" [class.text-bg-danger]="u.rol === 'ADMIN'"
                    [class.text-bg-secondary]="u.rol === 'USUARIO'">{{ u.rol }}</span>
              <p class="small text-muted mt-3 mb-1">Miembro desde {{ u.fechaRegistro | date:'dd/MM/yyyy' }}</p>
              @if (u.bio) { <p class="small fst-italic">"{{ u.bio }}"</p> }
              <hr>
              <h2 class="h6 text-start">Mis temas ({{ misTemas().length }})</h2>
              <ul class="list-group list-group-flush text-start small">
                @for (t of misTemas(); track t.id) {
                  <li class="list-group-item px-0"><a [routerLink]="['/temas', t.id]">{{ t.titulo }}</a></li>
                } @empty {
                  <li class="list-group-item px-0 text-muted">Aún no publicas temas.</li>
                }
              </ul>
            </div>
          </div>
        </div>

        <div class="col-12 col-lg-8">
          <div class="card shadow-sm mb-4">
            <div class="card-body p-4">
              <h2 class="h5 mb-3"><i class="bi bi-person-gear me-2"></i>Modificar perfil</h2>
              <form [formGroup]="formPerfil" (ngSubmit)="guardarPerfil()" novalidate>
                <div class="row g-3">
                  <div class="col-12 col-md-6">
                    <label class="form-label" for="usuario">Nombre de usuario</label>
                    <input id="usuario" class="form-control" [value]="u.nombreUsuario" disabled>
                    <div class="form-text">El nombre de usuario no se puede cambiar.</div>
                  </div>
                  <div class="col-12 col-md-6">
                    <label class="form-label" for="nombre">Nombre completo</label>
                    <input id="nombre" class="form-control" formControlName="nombreCompleto"
                           [class.is-invalid]="ePerfil('nombreCompleto').length">
                    @for (m of ePerfil('nombreCompleto'); track m) { <div class="invalid-feedback">{{ m }}</div> }
                  </div>
                  <div class="col-12">
                    <label class="form-label" for="correo">Correo electrónico</label>
                    <input id="correo" type="email" class="form-control" formControlName="email"
                           [class.is-invalid]="ePerfil('email').length">
                    @for (m of ePerfil('email'); track m) { <div class="invalid-feedback">{{ m }}</div> }
                  </div>
                  <div class="col-12">
                    <label class="form-label" for="bio">Sobre mí <span class="text-muted">(opcional)</span></label>
                    <textarea id="bio" rows="3" class="form-control" formControlName="bio"
                              [class.is-invalid]="ePerfil('bio').length"></textarea>
                    <div class="form-text">{{ formPerfil.controls.bio.value.length }}/200</div>
                    @for (m of ePerfil('bio'); track m) { <div class="invalid-feedback">{{ m }}</div> }
                  </div>
                </div>
                <button class="btn btn-primario mt-3" type="submit">Guardar cambios</button>
              </form>
            </div>
          </div>

          <div class="card shadow-sm">
            <div class="card-body p-4">
              <h2 class="h5 mb-3"><i class="bi bi-shield-lock me-2"></i>Cambiar contraseña</h2>
              <form [formGroup]="formClave" (ngSubmit)="cambiarClave()" novalidate>
                <div class="row g-3">
                  <div class="col-12 col-md-4">
                    <label class="form-label" for="actual">Contraseña actual</label>
                    <input id="actual" type="password" class="form-control" formControlName="actual"
                           [class.is-invalid]="eClave('actual').length">
                    @for (m of eClave('actual'); track m) { <div class="invalid-feedback">{{ m }}</div> }
                  </div>
                  <div class="col-12 col-md-4">
                    <label class="form-label" for="nueva">Nueva contraseña</label>
                    <input id="nueva" type="password" class="form-control" formControlName="password"
                           [class.is-invalid]="eClave('password').length">
                    @for (m of eClave('password'); track m) { <div class="invalid-feedback">{{ m }}</div> }
                  </div>
                  <div class="col-12 col-md-4">
                    <label class="form-label" for="confirmar">Confirmar</label>
                    <input id="confirmar" type="password" class="form-control" formControlName="confirmar"
                           [class.is-invalid]="eClave('confirmar').length">
                    @for (m of eClave('confirmar'); track m) { <div class="invalid-feedback">{{ m }}</div> }
                  </div>
                  <div class="col-12"><app-reglas-password [valor]="formClave.controls.password.value" /></div>
                </div>
                <button class="btn btn-outline-primario mt-3" type="submit">Cambiar contraseña</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class PerfilPage {
  readonly facade = inject(ForoFacade);
  private readonly avisos = inject(AvisosService);
  private readonly fb = inject(FormBuilder).nonNullable;

  readonly misTemas = computed(() => {
    const u = this.facade.sesion();
    return u ? this.facade.temasDe(u.id) : [];
  });

  readonly formPerfil = this.fb.group({
    nombreCompleto: [this.facade.sesion()?.nombreCompleto ?? '', [Validators.required, Validators.minLength(3),
      Validators.maxLength(80), Validators.pattern(/^[A-Za-zÁÉÍÓÚÑáéíóúñÜü' ]+$/), noSoloEspacios()]],
    email: [this.facade.sesion()?.email ?? '', [Validators.required, Validators.email, Validators.maxLength(100)]],
    bio: [this.facade.sesion()?.bio ?? '', [Validators.maxLength(200)]],
  });

  readonly formClave = this.fb.group({
    actual: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(20), passwordSegura()]],
    confirmar: ['', [Validators.required]],
  }, { validators: [camposIguales('password', 'confirmar')] });

  ePerfil(campo: string): string[] {
    return mensajesError(this.formPerfil.get(campo));
  }

  eClave(campo: string): string[] {
    return mensajesError(this.formClave.get(campo));
  }

  guardarPerfil(): void {
    this.formPerfil.markAllAsTouched();
    if (this.formPerfil.invalid) return;
    this.avisos.resultado(this.facade.actualizarPerfil(this.formPerfil.getRawValue()));
  }

  cambiarClave(): void {
    this.formClave.markAllAsTouched();
    if (this.formClave.invalid) return;
    const v = this.formClave.getRawValue();
    const r = this.facade.cambiarPassword(v.actual, v.password);
    this.avisos.resultado(r);
    if (r.ok) this.formClave.reset();
  }
}
