import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ForoFacade } from '../facade/foro.facade';
import { AvisosService } from '../servicios/avisos.service';
import { camposIguales, edadMinima, mensajesError, noSoloEspacios, passwordSegura } from '../validadores/validadores';
import { ReglasPassword } from './reglas-password';

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, RouterLink, ReglasPassword],
  template: `
    <div class="row justify-content-center">
      <div class="col-12 col-md-10 col-lg-8 col-xl-7">
        <div class="card tarjeta-form shadow-sm">
          <div class="card-body p-4">
            <h1 class="h4 mb-1"><i class="bi bi-person-plus me-2"></i>Crear cuenta</h1>
            <p class="text-muted small mb-4">Únete a la comunidad de TecnoForo. Todos los campos son obligatorios.</p>

            @if (error()) {
              <div class="alert alert-danger py-2" role="alert">{{ error() }}</div>
            }

            <form [formGroup]="form" (ngSubmit)="registrar()" novalidate>
              <div class="row g-3">
                <div class="col-12 col-md-6">
                  <label for="nombreUsuario" class="form-label">Nombre de usuario</label>
                  <input id="nombreUsuario" class="form-control" formControlName="nombreUsuario"
                         placeholder="ej: jperez" [class.is-invalid]="errores('nombreUsuario').length">
                  <div class="form-text">3 a 20 caracteres: minúsculas, números, punto o guion bajo.</div>
                  @for (m of errores('nombreUsuario'); track m) { <div class="invalid-feedback">{{ m }}</div> }
                </div>
                <div class="col-12 col-md-6">
                  <label for="nombreCompleto" class="form-label">Nombre completo</label>
                  <input id="nombreCompleto" class="form-control" formControlName="nombreCompleto"
                         [class.is-invalid]="errores('nombreCompleto').length">
                  @for (m of errores('nombreCompleto'); track m) { <div class="invalid-feedback">{{ m }}</div> }
                </div>
                <div class="col-12 col-md-6">
                  <label for="email" class="form-label">Correo electrónico</label>
                  <input id="email" type="email" class="form-control" formControlName="email"
                         [class.is-invalid]="errores('email').length">
                  @for (m of errores('email'); track m) { <div class="invalid-feedback">{{ m }}</div> }
                </div>
                <div class="col-12 col-md-6">
                  <label for="nacimiento" class="form-label">Fecha de nacimiento</label>
                  <input id="nacimiento" type="date" class="form-control" formControlName="fechaNacimiento"
                         [class.is-invalid]="errores('fechaNacimiento').length">
                  @for (m of errores('fechaNacimiento'); track m) { <div class="invalid-feedback">{{ m }}</div> }
                </div>
                <div class="col-12 col-md-6">
                  <label for="password" class="form-label">Contraseña</label>
                  <input id="password" type="password" class="form-control" formControlName="password"
                         autocomplete="new-password" [class.is-invalid]="errores('password').length">
                  @for (m of errores('password'); track m) { <div class="invalid-feedback">{{ m }}</div> }
                </div>
                <div class="col-12 col-md-6">
                  <label for="confirmar" class="form-label">Confirmar contraseña</label>
                  <input id="confirmar" type="password" class="form-control" formControlName="confirmar"
                         autocomplete="new-password" [class.is-invalid]="errores('confirmar').length">
                  @for (m of errores('confirmar'); track m) { <div class="invalid-feedback">{{ m }}</div> }
                </div>
                <div class="col-12">
                  <app-reglas-password [valor]="form.controls.password.value" />
                </div>
                <div class="col-12">
                  <div class="form-check">
                    <input id="terminos" type="checkbox" class="form-check-input" formControlName="terminos"
                           [class.is-invalid]="errores('terminos').length">
                    <label for="terminos" class="form-check-label">Acepto las normas de convivencia del foro</label>
                    @for (m of errores('terminos'); track m) { <div class="invalid-feedback">{{ m }}</div> }
                  </div>
                </div>
              </div>
              <div class="d-flex flex-column flex-sm-row gap-2 mt-4">
                <button class="btn btn-primario" type="submit">Crear cuenta</button>
                <a class="btn btn-outline-secondary" routerLink="/login">Ya tengo cuenta</a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class RegistroPage {
  private readonly facade = inject(ForoFacade);
  private readonly avisos = inject(AvisosService);
  private readonly router = inject(Router);

  readonly error = signal('');

  readonly form = inject(FormBuilder).nonNullable.group({
    nombreUsuario: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20),
      Validators.pattern(/^[a-z0-9._]+$/)]],
    nombreCompleto: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(80),
      Validators.pattern(/^[A-Za-zÁÉÍÓÚÑáéíóúñÜü' ]+$/), noSoloEspacios()]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(100),
      Validators.pattern(/^[^@\s]+@[^@\s]+\.[a-zA-Z]{2,}$/)]],
    fechaNacimiento: ['', [Validators.required, edadMinima(14)]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(20), passwordSegura()]],
    confirmar: ['', [Validators.required]],
    terminos: [false, [Validators.requiredTrue]],
  }, { validators: [camposIguales('password', 'confirmar')] });

  errores(campo: string): string[] {
    return mensajesError(this.form.get(campo));
  }

  registrar(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const r = this.facade.registrar({
      nombreUsuario: v.nombreUsuario, nombreCompleto: v.nombreCompleto, email: v.email, password: v.password,
    });
    if (!r.ok) {
      this.error.set(r.mensaje);
      return;
    }
    this.avisos.resultado(r);
    this.router.navigateByUrl('/');
  }
}
